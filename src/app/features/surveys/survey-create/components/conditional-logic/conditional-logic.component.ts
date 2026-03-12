import {
  Component,
  inject,
  OnInit,
  signal,
  effect,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { SurveyService } from '@features/surveys/services/survey.service';
import { SurveyLogicService } from '@features/surveys/services/survey-logic.service';
import { API_CONFIG } from '@/core/config/api.config';
import { MessageService } from 'primeng/api';
import { TreeSelectModule } from 'primeng/treeselect';
import { distinctUntilChanged, pairwise, startWith } from 'rxjs';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TreeNode } from 'primeng/api';
import { httpResource } from '@angular/common/http';
import { LucideAngularModule, Trash2, GitFork, Pencil } from 'lucide-angular';
import { BSelectComponent } from '@shared/components/b-select/b-select.component';
import { BCheckboxComponent } from '@shared/components/b-checkbox/b-checkbox.component';

@Component({
  selector: 'app-conditional-logic',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TreeSelectModule,
    MultiSelectModule,
    RadioButtonModule,
    LucideAngularModule,
    BSelectComponent,
    BCheckboxComponent,
  ],
  templateUrl: './conditional-logic.component.html',
  styles: [
    `
      .radio-btn {
        --p-radiobutton-checked-background: var(--color-primary-500);
        --p-radiobutton-checked-border-color: var(--color-primary-500);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConditionalLogicComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly surveyService = inject(SurveyService);
  private readonly logicService = inject(SurveyLogicService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  readonly GitForkIcon = GitFork;
  readonly TrashIcon = Trash2;
  readonly EditIcon = Pencil;

  id = signal<string | null>(
    this.route.snapshot.paramMap.get('id') ||
    this.route.parent?.snapshot.paramMap.get('id') ||
    null,
  );

  standaloneMode = signal<boolean>(!this.id());
  selectedSurveyId = signal<number | null>(null);

  // Load surveys for standalone mode with pagination and search
  surveySearch = signal('');
  surveyPage = signal(1);
  surveyParams = computed(() => ({
    page: this.surveyPage(),
    per_page: 20,
    search: this.surveySearch(),
  }));

  surveysResource = this.standaloneMode() ? this.surveyService.getSurveys(this.surveyParams) : null;

  surveyOptions = signal<{ label: string; value: number }[]>([]);

  domainTreeNodes = signal<TreeNode[]>([]);
  selectedTreeNode: any = null;

  // All questions in the survey (flat list useful for lookups)
  allQuestions = signal<any[]>([]);

  // Questions in the currently selected subdomain
  currentSubdomainQuestions = signal<any[]>([]);

  // The array of forms for logic rules in the current subdomain
  rulesForms = signal<FormGroup[]>([]);

  // Refactored surveyResource to depend on the final active signal
  activeSurveyId = signal<string | null>(this.id());
  surveyResource = httpResource<any>(() => {
    const surveyId = this.activeSurveyId();
    if (!surveyId) return undefined;
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SURVEYS.BASE}/${surveyId}`;
  });

  actionOptions = [
    { label: 'Hide', value: 'hide' },
    { label: 'N/A', value: 'na' },
    { label: 'Show', value: 'show' },
    { label: 'Answer', value: 'limited_answer' },
    { label: 'Comment', value: 'mandatory_comment' },
    { label: 'Alert', value: 'alert' },
    { label: 'Action Plan', value: 'mandatory_action_plan' },
  ];

  alertTypeOptions = [
    { label: 'Highlight', value: 'highlight' },
    { label: 'Raise an Alarm', value: 'raise_alarm' },
  ];

  constructor() {
    effect(() => {
      const res = this.surveysResource?.value();
      if (res?.data) {
        console.log(res.data);

        const mapped = res.data.map((s: any) => ({ label: s.name, value: s.id }));
        if (this.surveyPage() === 1) {
          this.surveyOptions.set(mapped);
        } else {
          this.surveyOptions.update((old) => [...old, ...mapped]);
        }
      } else if (res && !res.data && !this.surveysResource?.isLoading()) {
        if (this.surveyPage() === 1) this.surveyOptions.set([]);
      }
    });

    effect(() => {
      const data = this.surveyResource?.value();
      if (data) {
        this.processSurveyData(data);
      }
    });
  }

  ngOnInit() {
    // In standalone mode, we don't redirect
  }

  onSurveyChange(surveyId: number) {
    this.selectedSurveyId.set(surveyId);
    this.activeSurveyId.set(surveyId?.toString() || null);
    this.selectedTreeNode = null;
    this.currentSubdomainQuestions.set([]);
    this.rulesForms.set([]);
  }

  onSurveySearch(search: string) {
    this.surveySearch.set(search);
    this.surveyPage.set(1);
  }

  onSurveyScroll(event: any) {
    const res = this.surveysResource?.value();
    if (res && this.surveyPage() < res.last_page && !this.surveysResource?.isLoading()) {
      this.surveyPage.update((p) => p + 1);
    }
  }

  processSurveyData(data: any) {
    const nodes: TreeNode[] = [];
    let allQs: any[] = [];

    if (data.domains) {
      data.domains.forEach((d: any) => {
        nodes.push(this.mapDomainToTreeNode(d, allQs));
      });
    }
    this.domainTreeNodes.set(nodes);
    this.allQuestions.set(allQs);
  }

  mapDomainToTreeNode(domain: any, allQuestionsRef: any[]): TreeNode {
    const node: TreeNode = {
      key: `domain_${domain.id}`,
      label: domain.title,
      data: domain,
      selectable: false, // by default, only leaves are selectable
    };

    allQuestionsRef.push(...(domain.questions || []));

    if (domain.sub_domains && domain.sub_domains.length > 0) {
      node.children = domain.sub_domains.map((sd: any) =>
        this.mapDomainToTreeNode(sd, allQuestionsRef),
      );
      node.selectable = false;
    } else {
      // It's a leaf node
      node.selectable = true;
    }

    return node;
  }

  onNodeSelect(event: any) {
    const nodeData = event.node.data;
    if (!nodeData || !nodeData.questions) {
      this.currentSubdomainQuestions.set([]);
      this.rulesForms.set([]);
      return;
    }

    this.currentSubdomainQuestions.set(nodeData.questions);

    // Extract existing logic rules for this subdomain (both outgoing and incoming)
    const ruleMap = new Map<number, { triggerId: number; rule: any }>();

    nodeData.questions.forEach((q: any) => {
      // 1. Rules where this question is the TRIGGER
      if (q.logic_rules && q.logic_rules.length > 0) {
        q.logic_rules.forEach((rule: any) => {
          ruleMap.set(rule.id, { triggerId: q.id, rule });
        });
      }
      // 2. Rules where this question is the TARGET
      if (q.affected_by_rules && q.affected_by_rules.length > 0) {
        q.affected_by_rules.forEach((rule: any) => {
          // In affected_by_rules, the trigger_question might be nested
          const triggerId = rule.question_id || rule.trigger_question?.id;
          if (triggerId) {
            ruleMap.set(rule.id, { triggerId, rule });
          }
        });
      }
    });

    const existingRules: FormGroup[] = [];
    ruleMap.forEach((entry) => {
      existingRules.push(this.createRuleForm(entry.triggerId, entry.rule));
    });

    this.rulesForms.set(existingRules);
  }

  createRuleForm(triggerQuestionId: number | null, ruleData?: any): FormGroup {
    let uiActionType = ruleData?.action_type || '';
    let alertType = null;

    if (uiActionType === 'highlight' || uiActionType === 'raise_alarm') {
      alertType = uiActionType;
      uiActionType = 'alert';
    }

    const isEditing = ruleData ? false : true;

    const group = this.fb.group({
      id: [ruleData?.id || null],
      trigger_question_id: [triggerQuestionId, Validators.required],
      trigger_answer: [ruleData?.trigger_answer || null, Validators.required],
      ui_action_type: [uiActionType, Validators.required],
      target_question_ids: [
        ruleData?.target_question_ids ||
        (ruleData?.target_question_id ? [ruleData.target_question_id] : []),
      ],
      target_answer_options: [ruleData?.target_answer_options || []],
      alert_type: [alertType],
      isEditing: [isEditing],
    });

    if (!isEditing) {
      group.disable();
    }

    // Handle form value changes if needed for dependencies
    group
      .get('ui_action_type')
      ?.valueChanges.pipe(
        startWith(uiActionType),
        distinctUntilChanged(),
        pairwise(), // Compare old and new values
      )
      .subscribe(([oldVal, newVal]) => {
        // Only reset if it's a real change and we are actively editing
        if (oldVal && newVal && oldVal !== newVal && group.get('isEditing')?.value) {
          group.patchValue(
            {
              target_question_ids: [],
              target_answer_options: [],
              alert_type: null,
            },
            { emitEvent: false },
          );
        }
      });

    return group;
  }

  addRule() {
    const rules = this.rulesForms();
    rules.push(this.createRuleForm(null));
    this.rulesForms.set([...rules]);
  }

  removeRule(index: number) {
    const rules = this.rulesForms();
    const ruleId = rules[index].get('id')?.value;

    if (ruleId) {
      this.logicService.deleteLogicRule(ruleId).subscribe({
        next: () => {
          rules.splice(index, 1);
          this.rulesForms.set([...rules]);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Rule deleted',
          });
          this.surveyResource?.reload();
        },
        error: () =>
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not delete rule',
          }),
      });
    } else {
      rules.splice(index, 1);
      this.rulesForms.set([...rules]);
    }
  }

  saveRule(index: number) {
    const rules = this.rulesForms();
    const form = rules[index];

    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    const val = form.value;
    const triggerQId = val.trigger_question_id;

    let backendActionType = val.ui_action_type;
    if (backendActionType === 'alert') {
      backendActionType = val.alert_type;
    }

    const targetId = val.target_question_ids?.length ? val.target_question_ids[0] : undefined;

    const payload = {
      trigger_answer: val.trigger_answer,
      action_type: backendActionType,
      target_question_id: targetId,
      target_question_ids: val.target_question_ids?.length ? val.target_question_ids : undefined,
      target_answer_options: val.target_answer_options?.length
        ? val.target_answer_options
        : undefined,
    };

    if (val.id) {
      this.logicService.updateLogicRule(val.id, payload).subscribe({
        next: (res) => {
          form.patchValue({ isEditing: false });
          form.disable();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Rule updated',
          });
          this.surveyResource?.reload();
        },
        error: () =>
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not update rule',
          }),
      });
    } else {
      this.logicService.createLogicRule(triggerQId, payload).subscribe({
        next: (res) => {
          form.patchValue({ id: res.data?.id || res.id, isEditing: false });
          form.disable();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Rule created',
          });
          this.surveyResource?.reload();
        },
        error: () =>
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not create rule',
          }),
      });
    }
  }

  editRule(index: number) {
    const rules = this.rulesForms();
    rules[index].patchValue({ isEditing: true });
    rules[index].enable();
  }

  getQuestionOptions(questionId: number | null): any[] {
    if (!questionId) return [];
    // Look in all questions to handle rules with triggers outside the current subdomain
    const q = this.allQuestions().find((q: any) => q.id === questionId);
    if (!q || !q.meta_data || !q.meta_data.options) return [];
    // Primeng dropdowns can bind to objects or primitive arrays. Let's stick to an object array with label/value properties.
    return q.meta_data.options.map((opt: string) => ({ label: opt, value: opt }));
  }

  get targetQuestionOptions(): any[] {
    return this.currentSubdomainQuestions().map((q: any) => ({ label: q.text, value: q.id }));
  }

  // Options for the "If This Question" dropdown
  getTriggerQuestionOptions(currentRuleTriggerId: number | null): any[] {
    const options = [...this.targetQuestionOptions];

    // If the rule has a trigger from outside the subdomain, add it to options so it shows correctly
    if (currentRuleTriggerId && !options.find((opt) => opt.value === currentRuleTriggerId)) {
      const q = this.allQuestions().find((q) => q.id === currentRuleTriggerId);
      if (q) {
        options.push({ label: q.text, value: q.id });
      }
    }
    return options;
  }

  getFilteredTargetOptions(triggerQuestionId: number): any[] {
    return this.targetQuestionOptions.filter((opt) => opt.value !== triggerQuestionId);
  }

  isAnswerSelected(form: FormGroup, answer: string): boolean {
    const selected = form.get('target_answer_options')?.value || [];
    return selected.includes(answer);
  }

  // Helper for HTML binding of single-select targeting an array
  getTargetId(form: FormGroup): number | null {
    const ids = form.get('target_question_ids')?.value;
    return ids && ids.length > 0 ? ids[0] : null;
  }

  setTargetId(form: FormGroup, id: number) {
    form.get('target_question_ids')?.setValue(id ? [id] : []);
    form.get('target_question_ids')?.markAsDirty();
  }

  toggleAnswer(form: FormGroup, answer: string) {
    const control = form.get('target_answer_options');
    const selected = [...(control?.value || [])];
    const index = selected.indexOf(answer);
    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(answer);
    }
    control?.setValue(selected);
    control?.markAsDirty();
  }

  onCancel() {
    this.router.navigate(['/survey']);
  }

  onSkip() {
    this.onNext();
  }

  onNext() {
    this.router.navigate(['/survey', 'edit', this.id(), 'overview']);
  }
}
