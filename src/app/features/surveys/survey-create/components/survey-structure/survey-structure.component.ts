import { Component, inject, signal, OnInit, effect, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import {
  LucideAngularModule,
  Plus,
  Trash2,
  ChevronUp,
  FastForward,
  ArrowRight,
  LayoutGrid,
  Pencil,
} from 'lucide-angular';
import { MessageService } from 'primeng/api';
import { EditorModule } from 'primeng/editor';
import { BInputComponent } from '@shared/components/b-input/b-input.component';
import { SurveyService } from '@features/surveys/services/survey.service';

@Component({
  selector: 'app-survey-structure',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LucideAngularModule,
    EditorModule,
    BInputComponent,
    TooltipModule,
  ],
  templateUrl: './survey-structure.component.html',
  styleUrl: './survey-structure.component.css',
})
export class SurveyStructureComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly surveyService = inject(SurveyService);
  private readonly messageService = inject(MessageService);

  readonly plusIcon = Plus;
  readonly trashIcon = Trash2;
  readonly chevronUpIcon = ChevronUp;
  readonly skipIcon = FastForward;
  readonly arrowRightIcon = ArrowRight;
  readonly domainIcon = LayoutGrid;
  readonly pencilIcon = Pencil;

  id = signal<string | null>(
    this.route.snapshot.paramMap.get('id') ||
      this.route.parent?.snapshot.paramMap.get('id') ||
      null,
  );
  isSubmitting = signal(false);
  isLoaded = signal(false);
  weightingType = signal<'manual' | 'question_count'>('question_count');
  surveyName = signal('');

  // View states: 'tree' | 'add_question' | 'review_questions'
  currentView = signal<'tree' | 'add_question' | 'review_questions'>('tree');
  isConfirmationView = signal(false);

  // Track context for adding question
  activeNodeContext = signal<{
    domain: FormGroup;
    breadcrumbs: string[];
    editIndex?: number;
  } | null>(null);

  structureForm: FormGroup = this.fb.group({
    domains: this.fb.array([]),
  });

  questionForm: FormGroup = this.fb.group({
    text: ['', Validators.required],
    description: ['', Validators.required],
    options: this.fb.array([]),
  });

  // Resource for loading existing survey data
  surveyResource = this.id() ? this.surveyService.getSurveyById(this.id()!) : null;

  private lastSyncedSnapshot: any[] = [];

  constructor() {
    effect(() => {
      const data = this.surveyResource?.value();
      if (data) {
        console.log(data);

        this.weightingType.set(data.weighting_type || 'question_count');
        this.surveyName.set(data.title);
        if (data.domains && data.domains.length > 0) {
          this.patchDomains(data.domains);
          this.lastSyncedSnapshot = structuredClone(this.domains.getRawValue());
        }
        this.isLoaded.set(true);
      }
    });
  }

  get domains() {
    return this.structureForm.get('domains') as FormArray;
  }

  private formValue = toSignal(this.structureForm.valueChanges);

  isStructureValid = computed(() => {
    // Accessing formValue to trigger reactivity on any form change
    this.formValue();
    const domainsArray = this.domains;
    if (domainsArray.length === 0) return false;
    return this.validateDomainNodes(domainsArray);
  });

  private validateDomainNodes(domainsArray: FormArray): boolean {
    for (const control of domainsArray.controls) {
      const node = control as FormGroup;
      const subdomains = this.getSubdomains(node);
      const questions = this.getQuestions(node);

      if (subdomains.length > 0) {
        if (!this.validateDomainNodes(subdomains)) {
          return false;
        }
      } else {
        if (questions.length === 0) {
          return false;
        }
      }
    }
    return true;
  }

  ngOnInit() {
    if (!this.id()) {
      this.router.navigate(['/survey/create/setup']);
      return;
    }
  }

  patchDomains(domainsData: any[]) {
    this.domains.clear();
    domainsData.forEach((d) => {
      this.domains.push(this.createDomainFormGroup(d));
    });
  }

  createDomainFormGroup(data: any = {}): FormGroup {
    const titleValue = data.title || '';
    return this.fb.group({
      id: [data.id || null],
      title: [titleValue, Validators.required],
      weight: [data.weight || 1],
      isExpanded: [data.isExpanded !== undefined ? data.isExpanded : true],
      lastTitle: [data.lastTitle !== undefined ? data.lastTitle : titleValue],
      questions: this.fb.array((data.questions || []).map((q: any) => this.fb.group(q))),
      sub_domains: this.fb.array(
        (data.sub_domains || []).map((sd: any) => this.createDomainFormGroup(sd)),
      ),
    });
  }

  addDomain() {
    const defaultTitle = `Domain ${this.domains.length + 1}`;
    this.domains.push(this.createDomainFormGroup({ title: defaultTitle }));
    this.syncDomains();
  }

  removeDomain(index: number) {
    this.domains.removeAt(index);
    this.syncDomains();
  }

  toggleNode(node: FormGroup) {
    const control = node.get('isExpanded');
    control?.setValue(!control.value);
  }

  getSubdomains(node: FormGroup): FormArray {
    return node.get('sub_domains') as FormArray;
  }

  getQuestions(node: FormGroup): FormArray {
    return node.get('questions') as FormArray;
  }

  addSubdomain(node: FormGroup) {
    const subdomains = this.getSubdomains(node);
    const defaultTitle = `Subdomain ${subdomains.length + 1}`;
    subdomains.push(this.createDomainFormGroup({ title: defaultTitle }));
    node.get('isExpanded')?.setValue(true);
    this.syncDomains();
  }

  removeSubdomain(parent: FormGroup, index: number) {
    this.getSubdomains(parent).removeAt(index);
    this.syncDomains();
  }

  // Called on blur of title/weight inputs to sync with backend
  onNodeBlur(node: FormGroup) {
    const currentTitle = node.get('title')?.value?.trim();
    if (!currentTitle) {
      node.get('title')?.setValue(node.get('lastTitle')?.value || '');
      // Even if title fails, we should still check the weight if manual
    } else if (node.get('lastTitle')?.value !== currentTitle) {
      node.get('lastTitle')?.setValue(currentTitle);
    }

    if (this.weightingType() === 'manual') {
      const weightCtrl = node.get('weight');
      if (weightCtrl && weightCtrl.value < 1) {
        weightCtrl.setValue(1);
      }
    }
    this.syncDomains();
  }

  // Collect the entire domains tree and PUT to surveys/{id}
  syncDomains() {
    if (!this.id()) return;
    const domainsPayload = this.collectDomains(this.domains);
    this.surveyService.updateSurvey(this.id()!, { domains: domainsPayload }).subscribe({
      next: (res) => {
        this.lastSyncedSnapshot = structuredClone(this.domains.getRawValue());
      },
      error: () => {
        this.patchDomains(this.lastSyncedSnapshot);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to sync survey structure. Changes reverted.',
        });
      },
    });
  }

  collectDomains(domainsArray: FormArray): any[] {
    return domainsArray.controls.map((d: any, i: number) => {
      const node = d as FormGroup;
      return {
        id: node.get('id')?.value || undefined,
        title: node.get('title')?.value,
        weight: node.get('weight')?.value || 0,
        order: i + 1,
        questions: this.getQuestions(node).controls.map((q: any, qi: number) => ({
          text: q.get('text')?.value,
          description: q.get('description')?.value || '',
          is_scored: q.get('is_scored')?.value ?? true,
          order: qi + 1,
          max_score: q.get('max_score')?.value || 0,
          meta_data: q.get('meta_data')?.value || null,
          type: q.get('type')?.value || 'radio',
        })),
        sub_domains: this.collectDomains(this.getSubdomains(node)),
      };
    });
  }

  canAddSubdomain(node: FormGroup): boolean {
    return this.getQuestions(node).length === 0;
  }

  canAddQuestion(node: FormGroup): boolean {
    return this.getSubdomains(node).length === 0;
  }

  prepareAddQuestion(node: FormGroup, breadcrumbs: string[]) {
    this.activeNodeContext.set({ domain: node, breadcrumbs });
    this.currentView.set('add_question');
    this.resetQuestionForm();
  }

  prepareEditQuestion(node: FormGroup, breadcrumbs: string[], editIndex: number) {
    this.activeNodeContext.set({ domain: node, breadcrumbs, editIndex });
    this.currentView.set('add_question');

    const qGroup = this.getQuestions(node).at(editIndex) as FormGroup;
    const val = qGroup.value;

    this.resetOptionsAndWeights();
    this.questionForm.patchValue({
      text: val.text,
      description: val.description,
    });

    const metaData = val.meta_data || {};
    const options = metaData.options || [];
    const weights = metaData.weights || {};
    const allowNa = metaData.allow_na || false;

    options.forEach((optText: string) => {
      if (allowNa && optText === 'N/A') {
        this.optionsArray.push(
          this.fb.group({
            text: ['N/A', Validators.required],
            weight: [0],
            isNa: [true],
          }),
        );
      } else {
        const weightValue = weights[optText] !== undefined ? weights[optText] : 0;
        this.optionsArray.push(
          this.fb.group({
            text: [optText, Validators.required],
            weight: [weightValue, [Validators.required, Validators.min(0)]],
            isNa: [false],
          }),
        );
      }
    });

    // Add at least one option if none exists to avoid empty states
    if (options.length === 0) {
      this.addOption();
    }
  }

  resetQuestionForm() {
    this.questionForm.reset({
      text: '',
      description: '',
    });
    this.resetOptionsAndWeights();
    this.addOption();
  }

  get optionsArray() {
    return this.questionForm.get('options') as FormArray;
  }

  get hasNaOption(): boolean {
    return this.optionsArray.controls.some((ctrl) => ctrl.get('isNa')?.value === true);
  }

  addOption() {
    this.optionsArray.push(
      this.fb.group({
        text: ['', Validators.required],
        weight: [0, [Validators.required, Validators.min(0)]],
        isNa: [false],
      }),
    );
  }

  addNaOption() {
    if (this.hasNaOption) return;
    this.optionsArray.push(
      this.fb.group({
        text: ['N/A', Validators.required],
        weight: [0],
        isNa: [true],
      }),
    );
  }

  removeOption(index: number) {
    if (this.optionsArray.length < 2) return;
    this.optionsArray.removeAt(index);
  }

  resetOptionsAndWeights() {
    this.optionsArray.clear();
  }

  onSaveQuestion() {
    // Backward-compatible wrapper (old template may still call it somewhere)
    this.onNextStepToReviewQuestions();
  }

  private saveQuestionToActiveDomain() {
    const val = this.questionForm.value;
    const optionsMapped: string[] = [];
    const weightsMapped: any = {};
    let maxScore = 0;
    let allowNa = false;

    val.options.forEach((opt: any) => {
      optionsMapped.push(opt.text);
      if (opt.isNa) {
        allowNa = true;
      } else {
        const w = opt.weight !== null && opt.weight !== undefined ? Number(opt.weight) : 0;
        weightsMapped[opt.text] = w;
        if (w > maxScore) {
          maxScore = w;
        }
      }
    });

    const meta_data: any = { options: optionsMapped };
    meta_data.weights = weightsMapped;
    meta_data.allow_na = allowNa;

    const questionData = {
      text: val.text,
      description: val.description,
      is_scored: true,
      max_score: maxScore,
      meta_data,
      type: 'radio',
    };

    const ctx = this.activeNodeContext();
    const targetNode = ctx?.domain;
    const editIndex = ctx?.editIndex;

    if (!targetNode) return;

    if (editIndex !== undefined) {
      const qGroup = this.getQuestions(targetNode).at(editIndex) as FormGroup;
      qGroup.patchValue(questionData);
    } else {
      this.getQuestions(targetNode).push(this.fb.group(questionData));
    }

    this.syncDomains();
  }

  private clearEditIndexFromContext() {
    const ctx = this.activeNodeContext();
    if (!ctx) return;
    this.activeNodeContext.set({ domain: ctx.domain, breadcrumbs: ctx.breadcrumbs });
  }

  onAddQuestion() {
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }

    this.saveQuestionToActiveDomain();
    this.clearEditIndexFromContext();
    this.resetQuestionForm();
    this.currentView.set('add_question');
  }

  onNextStepToReviewQuestions() {
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }

    this.saveQuestionToActiveDomain();
    this.clearEditIndexFromContext();
    this.currentView.set('review_questions');
  }

  onSaveStructure() {
    this.router.navigate(['/survey', 'edit', this.id(), 'conditional-logic']);
  }

  goToConfirmation() {
    if (this.isStructureValid()) {
      // Ensure the confirmation UI (bottom actions) is visible.
      this.currentView.set('tree');
      this.isConfirmationView.set(true);
    }
  }

  onCancelView() {
    if (this.currentView() === 'add_question' || this.currentView() === 'review_questions') {
      this.currentView.set('tree');
    } else {
      this.router.navigate(['/survey']);
    }
  }

  createBadge(level: number, index: number, pathIds: number[] = []): string {
    if (level === 0) {
      return `D${index + 1}`;
    }

    let badge = `D${(pathIds[0] !== undefined ? pathIds[0] : 0) + 1}`;

    if (level >= 1) {
      const sIndex = level === 1 ? index : pathIds[1];
      badge += `-S${(sIndex !== undefined ? sIndex : 0) + 1}`;
    }

    if (level >= 2) {
      for (let i = 2; i < level; i++) {
        badge += `-${(pathIds[i] !== undefined ? pathIds[i] : 0) + 1}`;
      }
      badge += `-${index + 1}`;
    }

    return badge;
  }
  getMaxQuestionScore(weights: any): number {
    const max: number = Math.max(...(Object.values(weights) as number[]));
    return max || 0;
  }
}
