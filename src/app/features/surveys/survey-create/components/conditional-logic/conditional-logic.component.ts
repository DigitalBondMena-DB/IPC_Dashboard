import {
  Component,
  inject,
  OnInit,
  signal,
  effect,
  ChangeDetectionStrategy,
  computed,
  model,
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
import { LucideAngularModule, Trash2, GitFork, Pencil, Save, Check } from 'lucide-angular';
import { BSelectComponent } from '@shared/components/b-select/b-select.component';
import { BCheckboxComponent } from '@shared/components/b-checkbox/b-checkbox.component';
import { BPageHeaderComponent } from '@/shared/components/b-page-header/b-page-header.component';

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
    BPageHeaderComponent,
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
  readonly SaveIcon = Save;
  readonly CheckIcon = Check;

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
  selectedTreeNode = model<any>(null);

  // All questions in the survey (flat list useful for lookups)
  allQuestions = signal<any[]>([]);

  // Questions in the currently selected subdomain
  currentSubdomainQuestions = signal<any[]>([]);

  // The array of forms for logic rules in the current subdomain
  rulesForms = signal<FormGroup[]>([this.createRuleForm(null)]);
  isConfirmationView = signal(false);

  reviewEditIndex = signal<number | null>(null);
  reviewEditForm = signal<FormGroup | null>(null);

  // Refactored surveyResource to depend on the final active signal
  activeSurveyId = signal<string | null>(this.id());
  surveyResource = httpResource<any>(() => {
    const surveyId = this.activeSurveyId();
    if (!surveyId) return undefined;
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SURVEYS.BASE}/${surveyId}`;
  });

  allLogicRules = computed(() => {
    const questions = this.allQuestions();
    const rules: any[] = [];
    const ruleIds = new Set<number>();

    questions.forEach((q) => {
      if (q.logic_rules) {
        q.logic_rules.forEach((r: any) => {
          if (!ruleIds.has(r.id)) {
            ruleIds.add(r.id);
            rules.push({ triggerQuestion: q, rule: r });
          }
        });
      }
    });
    return rules;
  });

  isAnyRuleEditing = computed(() => {
    return (
      this.rulesForms().some((form) => form.get('isEditing')?.value && !!form.get('id')?.value) ||
      this.reviewEditIndex() !== null
    );
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
    this.selectedTreeNode.set(null);
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

  findFirstLeaf(nodes: TreeNode[]): TreeNode | null {
    for (const node of nodes) {
      if (node.selectable) return node;
      if (node.children) {
        const childLeaf = this.findFirstLeaf(node.children);
        if (childLeaf) return childLeaf;
      }
    }
    return null;
  }

  mapDomainToTreeNode(domain: any, allQuestionsRef: any[]): TreeNode {
    const questionsText = (domain.questions || []).map((q: any) => q.text).join(' ');
    const node: TreeNode & { searchTitle?: string } = {
      key: `domain_${domain.id}`,
      label: domain.title,
      data: domain,
      selectable: false, // by default, only leaves are selectable
      searchTitle: `${domain.title} ${questionsText}`,
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

    if (existingRules.length === 0) {
      existingRules.push(this.createRuleForm(null));
    }

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
    const pendingRules = rules.filter((f) => f.get('isEditing')?.value || f.dirty);

    if (pendingRules.length > 0) {
      // Validate pending forms first
      const invalidForms = pendingRules.filter((f) => f.invalid);
      if (invalidForms.length > 0) {
        invalidForms.forEach((f) => f.markAllAsTouched());
        this.messageService.add({
          severity: 'error',
          summary: 'Incomplete Rule',
          detail: 'Please complete the current rule before adding a new one.',
        });
        return;
      }

      // Save all pending rules, then add new form
      let savedCount = 0;
      const totalToSave = pendingRules.length;

      pendingRules.forEach((form) => {
        const val = form.getRawValue();
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
          target_question_ids: val.target_question_ids?.length
            ? val.target_question_ids
            : undefined,
          target_answer_options: val.target_answer_options?.length
            ? val.target_answer_options
            : undefined,
        };

        const request = val.id
          ? this.logicService.updateLogicRule(val.id, payload)
          : this.logicService.createLogicRule(triggerQId, payload);

        request.subscribe({
          next: (res) => {
            form.patchValue({ id: res.data?.id || res.id, isEditing: false });
            form.disable();
            savedCount++;
            if (savedCount === totalToSave) {
              // All saved – add new empty form
              const updatedRules = this.rulesForms();
              updatedRules.push(this.createRuleForm(null));
              this.rulesForms.set([...updatedRules]);
              this.surveyResource?.reload();
              this.messageService.add({
                severity: 'success',
                summary: 'Saved',
                detail: 'Previous rule saved. New condition added.',
              });
            }
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Could not save the current rule.',
            });
          },
        });
      });
    } else {
      // No pending rules, just add new
      rules.push(this.createRuleForm(null));
      this.rulesForms.set([...rules]);
    }
  }

  openConfirmationView() {
    this.isConfirmationView.set(true);
  }

  backFromConfirmation() {
    this.isConfirmationView.set(false);
  }

  removeRule(index: number) {
    const rules = this.rulesForms();
    const ruleId = rules[index].get('id')?.value;

    if (ruleId) {
      this.logicService.deleteLogicRule(ruleId).subscribe({
        next: () => {
          rules.splice(index, 1);
          // Always keep at least one form
          if (rules.length === 0) {
            rules.push(this.createRuleForm(null));
          }
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
      // Always keep at least one form
      if (rules.length === 0) {
        rules.push(this.createRuleForm(null));
      }
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
          this.rulesForms.set([...rules]); // Notify signal of change
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
          this.rulesForms.set([...rules]); // Notify signal of change
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
    this.rulesForms.set([...rules]); // Notify signal of change
  }

  getQuestionTextById(id: number | null): string {
    if (!id) return '';
    return this.allQuestions().find((q) => q.id === id)?.text || 'Question ' + id;
  }

  saveAllRules(silent: boolean = false) {
    const rules = this.rulesForms();
    const pendingRules = rules.filter((f) => f.get('isEditing')?.value || f.dirty);

    if (pendingRules.length === 0 && !silent) {
      // Nothing to save – reset domain and show one empty form
      this.selectedTreeNode.set(null);
      this.currentSubdomainQuestions.set([]);
      this.rulesForms.set([this.createRuleForm(null)]);
      return;
    }

    // Check validity
    const invalidForms = pendingRules.filter((f) => f.invalid);
    if (invalidForms.length > 0) {
      invalidForms.forEach((f) => f.markAllAsTouched());
      if (!silent) {
        this.messageService.add({
          severity: 'error',
          summary: 'Incomplete Rules',
          detail: 'Please finish all required fields in logic rules.',
        });
      }
      return;
    }

    // Execute saves
    let savedCount = 0;
    const totalToSave = pendingRules.length;

    if (totalToSave === 0) {
      if (!silent) this.selectedTreeNode.set(null);
      return;
    }

    pendingRules.forEach((form, i) => {
      const val = form.getRawValue();
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

      const request = val.id
        ? this.logicService.updateLogicRule(val.id, payload)
        : this.logicService.createLogicRule(triggerQId, payload);

      request.subscribe({
        next: (res) => {
          savedCount++;
          if (savedCount === totalToSave) {
            if (!silent) {
              this.messageService.add({
                severity: 'success',
                summary: 'Saved',
                detail: 'All rules saved successfully',
              });
              this.selectedTreeNode.set(null);
              this.currentSubdomainQuestions.set([]);
              this.rulesForms.set([this.createRuleForm(null)]);
            }
            this.surveyResource?.reload();
          }
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Some rules could not be saved.',
          });
        },
      });
    });
  }

  onEditFromConfirmation(index: number) {
    const ruleEntry = this.allLogicRules()[index];
    if (!ruleEntry) return;

    this.reviewEditIndex.set(index);
    const form = this.createRuleForm(ruleEntry.triggerQuestion.id, ruleEntry.rule);
    form.get('isEditing')?.setValue(true);
    form.enable();
    this.reviewEditForm.set(form);
  }

  saveReviewRule(index: number) {
    const form = this.reviewEditForm();
    if (!form || form.invalid) {
      form?.markAllAsTouched();
      return;
    }

    const val = form.getRawValue();
    const triggerQId = val.trigger_question_id;
    let backendActionType = val.ui_action_type;
    if (backendActionType === 'alert') backendActionType = val.alert_type;

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

    this.logicService.updateLogicRule(val.id, payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Rule updated',
        });
        this.reviewEditIndex.set(null);
        this.reviewEditForm.set(null);
        this.surveyResource?.reload();
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not update rule',
        }),
    });
  }

  cancelReviewEdit() {
    this.reviewEditIndex.set(null);
    this.reviewEditForm.set(null);
  }

  onDeleteFromConfirmation(index: number) {
    // Reuse the existing deletion logic.
    this.removeRule(index);
  }

  private scrollToCondition(index: number) {
    const elId = `condition_rule_${index}`;
    let attempts = 0;

    const tryScroll = () => {
      const el = document.getElementById(elId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      attempts += 1;
      if (attempts >= 10) return;
      setTimeout(tryScroll, 50);
    };

    tryScroll();
  }

  getTriggerQuestionLabel(ruleForm: FormGroup): string {
    const id = ruleForm.get('trigger_question_id')?.value;
    if (!id) return '';
    return this.allQuestions().find((q: any) => q.id === id)?.text || '';
  }

  getActionSummary(ruleForm: FormGroup): string {
    const actionType = ruleForm.get('ui_action_type')?.value as string | null;
    if (!actionType) return '';

    if (actionType === 'alert') {
      const alertType = ruleForm.get('alert_type')?.value;
      const alertLabel =
        this.alertTypeOptions.find((x) => x.value === alertType)?.label || alertType || 'Alert';
      return `Alert: ${alertLabel}`;
    }

    const actionLabel = this.actionOptions.find((x) => x.value === actionType)?.label || actionType;

    return actionLabel;
  }

  getTargetSummary(ruleForm: FormGroup): string {
    const actionType = ruleForm.get('ui_action_type')?.value as string | null;
    if (!actionType) return '';

    const targetQId = this.getTargetId(ruleForm);
    const targetQLabel = targetQId
      ? this.allQuestions().find((q: any) => q.id === targetQId)?.text || ''
      : '';

    if (['show', 'hide', 'na', 'limited_answer'].includes(actionType)) {
      if (actionType === 'limited_answer') {
        const selected = ruleForm.get('target_answer_options')?.value || [];
        const answerText = selected.length ? selected.join(', ') : 'Any answer';
        return `Target: ${targetQLabel} • Answers: ${answerText}`;
      }

      return `Target: ${targetQLabel}`;
    }

    return '';
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

  getReviewTriggerOptions(currentId: number | null): any[] {
    return this.allQuestions().map((q) => ({ label: q.text, value: q.id }));
  }

  getReviewTargetOptions(triggerId: number | null): any[] {
    return this.allQuestions()
      .filter((q) => q.id !== triggerId)
      .map((q) => ({ label: q.text, value: q.id }));
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
    this.saveAllRules(true);
    this.router.navigate(['/survey', 'edit', this.id(), 'overview']);
  }
}
