import { Component, inject, signal, OnInit, effect } from '@angular/core';
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
import {
  LucideAngularModule,
  Plus,
  Trash2,
  ChevronUp,
  MessageCircleQuestionMark,
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
  ],
  templateUrl: './survey-structure.component.html',
  styles: [
    `
      :host ::ng-deep .p-editor-container .p-editor-content .ql-editor {
        min-height: 150px;
        font-family: 'Inter', sans-serif;
        color: #0e0e0e;
      }
      .custom-shadow {
        box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.05);
      }
      .leaf-node {
        border-left: 2px solid #16a34a;
        background-color: #f0fdf4;
      }
      .question-icon {
        position: relative;
        &::before {
          content: '';
          position: absolute;
          top: 50%;
          left: -8px;
          transform: translateY(-50%);
          width: 1px;
          height: 16px;
          background-color: var(--color-gray-700);
        }
      }
    `,
  ],
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
  readonly messageCircleQuestionMark = MessageCircleQuestionMark;
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

  // View states: 'tree' | 'add_question'
  currentView = signal<'tree' | 'add_question'>('tree');

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
    description: [''],
    options: this.fb.array([]),
    weights: this.fb.group({}),
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
      weight: [data.weight || 0],
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
      return;
    }
    if (node.get('lastTitle')?.value !== currentTitle) {
      node.get('lastTitle')?.setValue(currentTitle);
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
          meta_data: q.get('meta_data')?.value || null,
          type: 'radio',
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

    options.forEach((opt: string, i: number) => {
      this.optionsArray.push(this.fb.control(opt, Validators.required));
      if (weights[opt] !== undefined) {
        this.weightsGroup.addControl(`opt_${i}`, this.fb.control(weights[opt]));
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

  get weightsGroup() {
    return this.questionForm.get('weights') as FormGroup;
  }

  addOption() {
    const control = this.fb.control('', Validators.required);
    this.optionsArray.push(control);
    const optionName = `opt_${this.optionsArray.length - 1}`;
    this.weightsGroup.addControl(optionName, this.fb.control(0));
  }

  addNaOption() {
    const control = this.fb.control('N/A', Validators.required);
    this.optionsArray.push(control);
  }

  removeOption(index: number) {
    this.optionsArray.removeAt(index);
    this.weightsGroup.removeControl(`opt_${index}`);
  }

  resetOptionsAndWeights() {
    this.optionsArray.clear();
    const weightsKeys = Object.keys(this.weightsGroup.controls);
    weightsKeys.forEach((key) => this.weightsGroup.removeControl(key));
  }

  onSaveQuestion() {
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }

    const val = this.questionForm.value;
    const meta_data: any = { options: val.options };
    if (this.weightingType() === 'manual') {
      const weights: any = {};
      val.options.forEach((opt: string, i: number) => {
        if (val.weights[`opt_${i}`] !== undefined && val.weights[`opt_${i}`] !== null) {
          weights[opt] = val.weights[`opt_${i}`];
        }
      });
      meta_data.weights = weights;
    }

    const questionData = {
      text: val.text,
      description: val.description,
      is_scored: true,
      meta_data,
      type: 'radio',
    };

    const targetNode = this.activeNodeContext()?.domain;
    const editIndex = this.activeNodeContext()?.editIndex;

    if (targetNode) {
      if (editIndex !== undefined) {
        // Update existing question
        const qGroup = this.getQuestions(targetNode).at(editIndex) as FormGroup;
        qGroup.patchValue(questionData);
      } else {
        // Add new question
        this.getQuestions(targetNode).push(this.fb.group(questionData));
      }
      this.syncDomains();
    }

    this.currentView.set('tree');
  }

  onSaveStructure() {
    // Everything is already saved via real-time sync, just navigate
    this.router.navigate(['/survey', 'edit', this.id(), 'conditional-logic']);
  }

  onCancelView() {
    if (this.currentView() === 'add_question') {
      this.currentView.set('tree');
    } else {
      this.router.navigate(['/survey']);
    }
  }

  onSkip() {
    this.router.navigate(['/survey', 'edit', this.id(), 'conditional-logic']);
  }
}
