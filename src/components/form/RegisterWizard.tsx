import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { copy } from '../../content/copy';
import { submitForm, uploadRegistrationDocuments } from '../../lib/registrations';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { FormField } from './FormField';
import { ReviewStep } from './ReviewStep';
import { StepIndicator } from './StepIndicator';
import { UploadField } from './UploadField';
import { ErrorState } from './ErrorState';
import { SuccessState } from './SuccessState';
import { AccountType, FormValues } from './types';
import {
  formatCep,
  formatCnpj,
  formatCpf,
  formatPhone,
  isValidCep,
  isValidCnpj,
  isValidCpf,
  isValidPhone,
  stripNonDigits,
} from './utils';

const maxFileSize = 10 * 1024 * 1024;
const requiredMessage = 'Campo obrigatório.';
const invalidCpfMessage = 'CPF inválido.';
const invalidCnpjMessage = 'CNPJ inválido.';
const invalidCepMessage = 'CEP inválido.';
const invalidEmailMessage = 'Email inválido.';
const invalidFileTypeMessage = 'Formato de arquivo inválido.';
const docTypes = ['image/jpeg', 'image/png', 'application/pdf'];

const baseSchema = z.object({
  accountType: z.enum(['PF', 'PJ']),
  fullName: z.string().optional(),
  cpf: z.string().optional(),
  birthDate: z.string().optional(),
  rg: z.string().optional(),
  cnh: z.string().optional(),
  isForeigner: z.boolean().optional(),
  userEmail: z.string().optional(),
  userPhone: z.string().optional(),
  pepStatus: z.boolean().optional(),
  pepPosition: z.string().optional(),
  cep: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  foreignStreet: z.string().optional(),
  foreignNumber: z.string().optional(),
  foreignComplement: z.string().optional(),
  foreignDistrict: z.string().optional(),
  foreignCity: z.string().optional(),
  foreignState: z.string().optional(),
  foreignZipCode: z.string().optional(),
  foreignCountry: z.string().optional(),
  documentFront: z.any().optional(),
  documentBack: z.any().optional(),
  selfie: z.any().optional(),
  proofOfAddress: z.any().optional(),
  companyName: z.string().optional(),
  tradeName: z.string().optional(),
  cnpj: z.string().optional(),
  foundationDate: z.string().optional(),
  mainCNAE: z.string().optional(),
  companyEmail: z.string().optional(),
  companyPhone: z.string().optional(),
  legalNature: z.string().optional(),
  pjCep: z.string().optional(),
  pjStreet: z.string().optional(),
  pjNumber: z.string().optional(),
  pjComplement: z.string().optional(),
  pjDistrict: z.string().optional(),
  pjCity: z.string().optional(),
  pjState: z.string().optional(),
  majorityAdminName: z.string().optional(),
  majorityAdminCpf: z.string().optional(),
  majorityAdminEmail: z.string().optional(),
  majorityAdminPhone: z.string().optional(),
  articlesOfAssociation: z.any().optional(),
  cnpjCard: z.any().optional(),
  adminIdFront: z.any().optional(),
  adminIdBack: z.any().optional(),
  companyProofOfAddress: z.any().optional(),
  ecnpjCertificate: z.any().optional(),
  acceptTerms: z.boolean().optional(),
});

const schema = baseSchema.superRefine((data, ctx) => {
  if (!data.accountType) {
    ctx.addIssue({ code: 'custom', path: ['accountType'], message: requiredMessage });
  }

  const requireField = (name: keyof FormValues, message = requiredMessage) => {
    const value = data[name];
    if (typeof value === 'string') {
      if (!value.trim()) {
        ctx.addIssue({ code: 'custom', path: [name], message });
      }
      return;
    }
    if (!value) {
      ctx.addIssue({ code: 'custom', path: [name], message });
    }
  };

  const requireFile = (name: keyof FormValues, message: string, allowedTypes?: string[]) => {
    const file = data[name] as File | null | undefined;
    if (!file) {
      ctx.addIssue({ code: 'custom', path: [name], message });
      return;
    }
    if (file.size > maxFileSize) {
      ctx.addIssue({ code: 'custom', path: [name], message });
    }
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      ctx.addIssue({ code: 'custom', path: [name], message: invalidFileTypeMessage });
    }
  };

  if (data.accountType === 'PF') {
    requireField('fullName');
    requireField('cpf');
    requireField('birthDate');
    requireField('userEmail');
    requireField('userPhone');

    if (data.cpf && !isValidCpf(data.cpf)) {
      ctx.addIssue({ code: 'custom', path: ['cpf'], message: invalidCpfMessage });
    }

    if (data.userEmail && !/^\S+@\S+\.\S+$/.test(data.userEmail)) {
      ctx.addIssue({ code: 'custom', path: ['userEmail'], message: invalidEmailMessage });
    }

    if (data.userPhone && !isValidPhone(data.userPhone)) {
      ctx.addIssue({ code: 'custom', path: ['userPhone'], message: copy.form.phoneHint });
    }

    if (data.isForeigner) {
      requireField('foreignStreet');
      requireField('foreignNumber');
      requireField('foreignCity');
      requireField('foreignState');
      requireField('foreignZipCode');
    } else {
      requireField('cep');
      requireField('street');
      requireField('number');
      requireField('district');
      requireField('city');
      requireField('state');
      if (data.cep && !isValidCep(data.cep)) {
        ctx.addIssue({ code: 'custom', path: ['cep'], message: invalidCepMessage });
      }
    }

    requireFile('documentFront', copy.form.docHint, docTypes);
    requireFile('documentBack', copy.form.docHint, docTypes);

    const selfie = data.selfie as File | null | undefined;
    if (selfie && selfie.size > maxFileSize) {
      ctx.addIssue({ code: 'custom', path: ['selfie'], message: copy.form.selfieHint });
    }
    if (selfie && !['image/jpeg', 'image/png'].includes(selfie.type)) {
      ctx.addIssue({ code: 'custom', path: ['selfie'], message: invalidFileTypeMessage });
    }

    const proof = data.proofOfAddress as File | null | undefined;
    if (proof && proof.size > maxFileSize) {
      ctx.addIssue({ code: 'custom', path: ['proofOfAddress'], message: copy.form.proofHint });
    }
    if (proof && !docTypes.includes(proof.type)) {
      ctx.addIssue({ code: 'custom', path: ['proofOfAddress'], message: invalidFileTypeMessage });
    }
  }

  if (data.accountType === 'PJ') {
    requireField('companyName');
    requireField('tradeName');
    requireField('cnpj');
    requireField('foundationDate');
    requireField('mainCNAE');
    requireField('companyEmail');
    requireField('companyPhone');

    if (data.cnpj && !isValidCnpj(data.cnpj)) {
      ctx.addIssue({ code: 'custom', path: ['cnpj'], message: invalidCnpjMessage });
    }

    if (data.companyEmail && !/^\S+@\S+\.\S+$/.test(data.companyEmail)) {
      ctx.addIssue({ code: 'custom', path: ['companyEmail'], message: invalidEmailMessage });
    }

    if (data.companyPhone && !isValidPhone(data.companyPhone)) {
      ctx.addIssue({ code: 'custom', path: ['companyPhone'], message: copy.form.phoneHint });
    }

    requireField('pjCep');
    requireField('pjStreet');
    requireField('pjNumber');
    requireField('pjDistrict');
    requireField('pjCity');
    requireField('pjState');

    if (data.pjCep && !isValidCep(data.pjCep)) {
      ctx.addIssue({ code: 'custom', path: ['pjCep'], message: invalidCepMessage });
    }

    requireField('majorityAdminName');
    requireField('majorityAdminCpf');
    requireField('majorityAdminEmail');
    requireField('majorityAdminPhone');

    if (data.majorityAdminCpf && !isValidCpf(data.majorityAdminCpf)) {
      ctx.addIssue({ code: 'custom', path: ['majorityAdminCpf'], message: invalidCpfMessage });
    }

    if (data.majorityAdminEmail && !/^\S+@\S+\.\S+$/.test(data.majorityAdminEmail)) {
      ctx.addIssue({ code: 'custom', path: ['majorityAdminEmail'], message: invalidEmailMessage });
    }

    if (data.majorityAdminPhone && !isValidPhone(data.majorityAdminPhone)) {
      ctx.addIssue({ code: 'custom', path: ['majorityAdminPhone'], message: copy.form.phoneHint });
    }

    const articles = data.articlesOfAssociation as File | null | undefined;
    if (articles && articles.size > maxFileSize) {
      ctx.addIssue({ code: 'custom', path: ['articlesOfAssociation'], message: copy.form.articlesHint });
    }
    if (articles && articles.type !== 'application/pdf') {
      ctx.addIssue({ code: 'custom', path: ['articlesOfAssociation'], message: invalidFileTypeMessage });
    }

    const cnpjCard = data.cnpjCard as File | null | undefined;
    if (cnpjCard && cnpjCard.size > maxFileSize) {
      ctx.addIssue({ code: 'custom', path: ['cnpjCard'], message: copy.form.docHint });
    }
    if (cnpjCard && !docTypes.includes(cnpjCard.type)) {
      ctx.addIssue({ code: 'custom', path: ['cnpjCard'], message: invalidFileTypeMessage });
    }

    requireFile('adminIdFront', copy.form.docHint, docTypes);
    requireFile('adminIdBack', copy.form.docHint, docTypes);

    const companyProof = data.companyProofOfAddress as File | null | undefined;
    if (companyProof && companyProof.size > maxFileSize) {
      ctx.addIssue({ code: 'custom', path: ['companyProofOfAddress'], message: copy.form.docHint });
    }
    if (companyProof && !docTypes.includes(companyProof.type)) {
      ctx.addIssue({ code: 'custom', path: ['companyProofOfAddress'], message: invalidFileTypeMessage });
    }

    const ecnpj = data.ecnpjCertificate as File | null | undefined;
    if (ecnpj && !ecnpj.name.toLowerCase().endsWith('.pfx')) {
      ctx.addIssue({ code: 'custom', path: ['ecnpjCertificate'], message: invalidFileTypeMessage });
    }
  }

  if (!data.acceptTerms) {
    ctx.addIssue({ code: 'custom', path: ['acceptTerms'], message: requiredMessage });
  }
});

export function RegisterWizard() {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [cepLoading, setCepLoading] = useState(false);
  const [pjCepLoading, setPjCepLoading] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      accountType: 'PF',
      isForeigner: false,
      pepStatus: false,
      acceptTerms: false,
    },
  });

  const {
    watch,
    trigger,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  const accountType = watch('accountType');
  const isForeigner = watch('isForeigner');
  const pepStatus = watch('pepStatus');
  const cep = watch('cep');
  const pjCep = watch('pjCep');

  useEffect(() => {
    const lookupCep = async (value: string, prefix: 'pf' | 'pj') => {
      const cleaned = stripNonDigits(value);
      if (cleaned.length !== 8) return;
      try {
        prefix === 'pf' ? setCepLoading(true) : setPjCepLoading(true);
        const response = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
        const data = await response.json();
        if (data?.erro) return;
        if (prefix === 'pf') {
          setValue('street', data.logradouro || '', { shouldValidate: true });
          setValue('district', data.bairro || '', { shouldValidate: true });
          setValue('city', data.localidade || '', { shouldValidate: true });
          setValue('state', data.uf || '', { shouldValidate: true });
        } else {
          setValue('pjStreet', data.logradouro || '', { shouldValidate: true });
          setValue('pjDistrict', data.bairro || '', { shouldValidate: true });
          setValue('pjCity', data.localidade || '', { shouldValidate: true });
          setValue('pjState', data.uf || '', { shouldValidate: true });
        }
      } catch (error) {
        console.error(error);
      } finally {
        prefix === 'pf' ? setCepLoading(false) : setPjCepLoading(false);
      }
    };

    if (cep) {
      void lookupCep(cep, 'pf');
    }
  }, [cep, setValue]);

  useEffect(() => {
    if (pjCep) {
      const run = async () => {
        const cleaned = stripNonDigits(pjCep);
        if (cleaned.length !== 8) return;
        try {
          setPjCepLoading(true);
          const response = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
          const data = await response.json();
          if (data?.erro) return;
          setValue('pjStreet', data.logradouro || '', { shouldValidate: true });
          setValue('pjDistrict', data.bairro || '', { shouldValidate: true });
          setValue('pjCity', data.localidade || '', { shouldValidate: true });
          setValue('pjState', data.uf || '', { shouldValidate: true });
        } catch (error) {
          console.error(error);
        } finally {
          setPjCepLoading(false);
        }
      };
      void run();
    }
  }, [pjCep, setValue]);

  const steps = useMemo(() => {
    const isPF = accountType === 'PF';
    return [
      { label: copy.form.accountType, fields: ['accountType'] },
      {
        label: isPF ? copy.form.pfSection : copy.form.companySection,
        fields: isPF
          ? [
              'fullName',
              'cpf',
              'birthDate',
              'rg',
              'cnh',
              'userEmail',
              'userPhone',
              'pepStatus',
              'pepPosition',
            ]
          : [
              'companyName',
              'tradeName',
              'cnpj',
              'foundationDate',
              'mainCNAE',
              'companyEmail',
              'companyPhone',
              'legalNature',
            ],
      },
      {
        label: isPF ? copy.form.addressSection : copy.form.fiscalAddress,
        fields: isPF
          ? isForeigner
            ? [
                'foreignStreet',
                'foreignNumber',
                'foreignComplement',
                'foreignDistrict',
                'foreignCity',
                'foreignState',
                'foreignZipCode',
                'foreignCountry',
              ]
            : ['cep', 'street', 'number', 'complement', 'district', 'city', 'state']
          : [
              'pjCep',
              'pjStreet',
              'pjNumber',
              'pjComplement',
              'pjDistrict',
              'pjCity',
              'pjState',
              'majorityAdminName',
              'majorityAdminCpf',
              'majorityAdminEmail',
              'majorityAdminPhone',
            ],
      },
      {
        label: isPF ? copy.form.documentsSection : copy.form.companyDocsSection,
        fields: isPF
          ? ['documentFront', 'documentBack', 'selfie', 'proofOfAddress']
          : [
              'articlesOfAssociation',
              'cnpjCard',
              'adminIdFront',
              'adminIdBack',
              'companyProofOfAddress',
              'ecnpjCertificate',
            ],
      },
      { label: copy.form.submit, fields: ['acceptTerms'] },
    ];
  }, [accountType, isForeigner]);

  const handleNext = async () => {
    const fields = steps[step].fields as (keyof FormValues)[];
    const valid = await trigger(fields);
    if (!valid) return;
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: FormValues) => {
    setStatus('submitting');
    try {
      if (!navigator.onLine) {
        throw new Error('offline');
      }
      const docId = await submitForm(data);
      await uploadRegistrationDocuments(docId, data);
      setStatus('success');
    } catch (err: any) {
      console.log('🔥 firebase error:', err?.code, err?.message);
      setStatus('error');
    }
  };

  const resetFlow = () => {
    reset();
    setStep(0);
    setStatus('idle');
  };

  if (status === 'success') {
    return <SuccessState onReset={resetFlow} />;
  }

  if (status === 'error') {
    return <ErrorState onRetry={() => setStatus('idle')} />;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <StepIndicator steps={steps} currentStep={step} />

        <Card className="border-border/60 p-6 md:p-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`step-${step}`}
              className="space-y-6"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
            {step === 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">{copy.form.accountType}</h3>
                <Controller
                  name="accountType"
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={(value) => field.onChange(value as AccountType)}
                      className="grid gap-4 md:grid-cols-2"
                    >
                      {[
                        { value: 'PF', label: copy.form.pf },
                        { value: 'PJ', label: copy.form.pj },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={cn(
                            'flex cursor-pointer items-center justify-between rounded-2xl border p-5 text-sm font-medium',
                            field.value === option.value
                              ? 'border-primary bg-accent/60 text-foreground'
                              : 'border-border/60 text-muted-foreground',
                          )}
                        >
                          <span>{option.label}</span>
                          <RadioGroupItem value={option.value} />
                        </label>
                      ))}
                    </RadioGroup>
                  )}
                />
              </div>
            ) : null}

            {step === 1 && accountType === 'PF' ? (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground">{copy.form.pfSection}</h3>
                <FormField name="fullName" label={copy.form.fullName} placeholder="Nome completo" />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    name="cpf"
                    label={copy.form.cpf}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    mask={formatCpf}
                    inputMode="numeric"
                    hint={copy.form.cpfHint}
                  />
                  <FormField name="birthDate" label={copy.form.birthDate} type="date" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField name="rg" label={copy.form.rg} placeholder="00.000.000-0" />
                  <FormField name="cnh" label={copy.form.cnh} placeholder="00000000000" />
                </div>
                <div className="flex items-center gap-3">
                  <Controller
                    name="isForeigner"
                    render={({ field }) => (
                      <Checkbox id="isForeigner" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <Label htmlFor="isForeigner">{copy.form.foreigner}</Label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    name="userEmail"
                    label={copy.form.email}
                    placeholder="seu@email.com"
                    type="email"
                    autoComplete="email"
                  />
                  <FormField
                    name="userPhone"
                    label={copy.form.phone}
                    placeholder="Ex: +5511999999999"
                    inputMode="tel"
                    mask={formatPhone}
                    hint={copy.form.phoneHint}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Controller
                      name="pepStatus"
                      render={({ field }) => (
                        <Checkbox id="pepStatus" checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                    <Label htmlFor="pepStatus">{copy.form.pep}</Label>
                  </div>
                  {pepStatus ? (
                    <FormField
                      name="pepPosition"
                      label={copy.form.pepPosition}
                      placeholder="Ex: Deputado, Prefeito, etc."
                    />
                  ) : null}
                </div>
              </div>
            ) : null}

            {step === 1 && accountType === 'PJ' ? (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground">{copy.form.companySection}</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField name="companyName" label={copy.form.companyName} placeholder="Razão Social" />
                  <FormField name="tradeName" label={copy.form.tradeName} placeholder="Nome Fantasia" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    name="cnpj"
                    label={copy.form.cnpj}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                    mask={formatCnpj}
                    inputMode="numeric"
                  />
                  <FormField name="foundationDate" label={copy.form.foundationDate} type="date" />
                </div>
                <FormField
                  name="mainCNAE"
                  label={copy.form.cnae}
                  placeholder="0000-0/00"
                  inputMode="numeric"
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    name="companyEmail"
                    label={copy.form.companyEmail}
                    placeholder="empresa@email.com"
                    type="email"
                    autoComplete="email"
                  />
                  <FormField
                    name="companyPhone"
                    label={copy.form.companyPhone}
                    placeholder="Ex: +5511999999999"
                    inputMode="tel"
                    mask={formatPhone}
                    hint={copy.form.phoneHint}
                  />
                </div>
                <FormField
                  name="legalNature"
                  label={copy.form.legalNature}
                  placeholder="Ex: Sociedade Limitada"
                />
              </div>
            ) : null}

            {step === 2 && accountType === 'PF' ? (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground">{copy.form.addressSection}</h3>
                {isForeigner ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      name="foreignStreet"
                      label={copy.form.foreignStreet}
                      placeholder="Street, Avenue, etc."
                    />
                    <FormField name="foreignNumber" label={copy.form.foreignNumber} placeholder="123" />
                    <FormField
                      name="foreignComplement"
                      label={copy.form.foreignComplement}
                      placeholder="Apt, Suite, etc."
                    />
                    <FormField
                      name="foreignDistrict"
                      label={copy.form.foreignDistrict}
                      placeholder="District, Borough, etc."
                    />
                    <FormField name="foreignCity" label={copy.form.foreignCity} placeholder="City" />
                    <FormField
                      name="foreignState"
                      label={copy.form.foreignState}
                      placeholder="State, Province, etc."
                    />
                    <FormField
                      name="foreignZipCode"
                      label={copy.form.foreignZip}
                      placeholder="ZIP Code, Postal Code"
                    />
                    <FormField name="foreignCountry" label={copy.form.foreignCountry} placeholder="Country" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        name="cep"
                        label={copy.form.cep}
                        placeholder="00000-000"
                        maxLength={9}
                        mask={formatCep}
                        inputMode="numeric"
                      />
                      <FormField
                        name="street"
                        label={copy.form.street}
                        placeholder="Rua, Avenida, etc."
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField name="number" label={copy.form.number} placeholder="123" />
                      <FormField
                        name="complement"
                        label={copy.form.complement}
                        placeholder="Apto, Bloco, etc."
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField name="district" label={copy.form.district} />
                      <FormField name="city" label={copy.form.city} />
                      <FormField name="state" label={copy.form.state} placeholder="SP" maxLength={2} />
                    </div>
                    {cepLoading ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="h-2 w-2 animate-ping rounded-full bg-primary" />
                        <span>{copy.form.cep}</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}

            {step === 2 && accountType === 'PJ' ? (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground">{copy.form.fiscalAddress}</h3>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      name="pjCep"
                      label={copy.form.cep}
                      placeholder="00000-000"
                      maxLength={9}
                      mask={formatCep}
                      inputMode="numeric"
                    />
                    <FormField
                      name="pjStreet"
                      label={copy.form.street}
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField name="pjNumber" label={copy.form.number} placeholder="123" />
                    <FormField
                      name="pjComplement"
                      label={copy.form.complement}
                      placeholder="Sala, Andar, etc."
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField name="pjDistrict" label={copy.form.district} />
                    <FormField name="pjCity" label={copy.form.city} />
                    <FormField name="pjState" label={copy.form.state} placeholder="SP" maxLength={2} />
                  </div>
                  {pjCepLoading ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="h-2 w-2 animate-ping rounded-full bg-primary" />
                      <span>{copy.form.cep}</span>
                    </div>
                  ) : null}
                </div>

                <h3 className="text-lg font-semibold text-foreground">{copy.form.adminSection}</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    name="majorityAdminName"
                    label={copy.form.adminName}
                    placeholder="Nome do administrador"
                  />
                  <FormField
                    name="majorityAdminCpf"
                    label={copy.form.adminCpf}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    mask={formatCpf}
                    inputMode="numeric"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    name="majorityAdminEmail"
                    label={copy.form.adminEmail}
                    placeholder="admin@email.com"
                    type="email"
                  />
                  <FormField
                    name="majorityAdminPhone"
                    label={copy.form.adminPhone}
                    placeholder="Ex: +5511999999999"
                    inputMode="tel"
                    mask={formatPhone}
                    hint={copy.form.phoneHint}
                  />
                </div>
              </div>
            ) : null}

            {step === 3 && accountType === 'PF' ? (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground">{copy.form.documentsSection}</h3>
                <UploadField
                  name="documentFront"
                  label={copy.form.docFront}
                  hint={copy.form.docHint}
                  accept="image/jpeg,image/png,application/pdf"
                  required
                />
                <UploadField
                  name="documentBack"
                  label={copy.form.docBack}
                  hint={copy.form.docHint}
                  accept="image/jpeg,image/png,application/pdf"
                  required
                />
                <UploadField
                  name="selfie"
                  label={copy.form.selfie}
                  hint={copy.form.selfieHint}
                  accept="image/jpeg,image/png"
                />
                <UploadField
                  name="proofOfAddress"
                  label={copy.form.proofOfAddress}
                  hint={copy.form.proofHint}
                  accept="image/jpeg,image/png,application/pdf"
                />
              </div>
            ) : null}

            {step === 3 && accountType === 'PJ' ? (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground">{copy.form.companyDocsSection}</h3>
                <UploadField
                  name="articlesOfAssociation"
                  label={copy.form.articles}
                  hint={copy.form.articlesHint}
                  accept="application/pdf"
                />
                <UploadField
                  name="cnpjCard"
                  label={copy.form.cnpjCard}
                  hint={copy.form.docHint}
                  accept="image/jpeg,image/png,application/pdf"
                />
                <UploadField
                  name="adminIdFront"
                  label={copy.form.adminIdFront}
                  hint={copy.form.docHint}
                  accept="image/jpeg,image/png,application/pdf"
                  required
                />
                <UploadField
                  name="adminIdBack"
                  label={copy.form.adminIdBack}
                  hint={copy.form.docHint}
                  accept="image/jpeg,image/png,application/pdf"
                  required
                />
                <UploadField
                  name="companyProofOfAddress"
                  label={copy.form.companyProof}
                  hint={copy.form.docHint}
                  accept="image/jpeg,image/png,application/pdf"
                />
                <UploadField
                  name="ecnpjCertificate"
                  label={copy.form.ecnpj}
                  hint={copy.form.ecnpjHint}
                  accept=".pfx"
                />
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-6">
                <ReviewStep values={methods.getValues()} accountType={accountType} onEdit={setStep} />
                <div className="flex items-center gap-3 rounded-xl border border-border/60 p-4">
                  <Controller
                    name="acceptTerms"
                    render={({ field }) => (
                      <Checkbox id="acceptTerms" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <Label htmlFor="acceptTerms" className="text-sm text-muted-foreground">
                    {copy.form.acceptTermsStart}{' '}
                    <a href="#" className="text-foreground underline">
                      {copy.form.terms}
                    </a>{' '}
                    {copy.form.termsMiddle}{' '}
                    <a href="#" className="text-foreground underline">
                      {copy.form.privacy}
                    </a>
                    <span className="text-foreground"> *</span>
                  </Label>
                </div>
                {errors.acceptTerms ? (
                  <p className="text-xs text-red-600">{errors.acceptTerms.message as string}</p>
                ) : null}
              </div>
            ) : null}
            </motion.div>
          </AnimatePresence>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {step > 0 ? (
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleBack}>
                Voltar
              </Button>
            ) : null}
            <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={resetFlow}>
              {copy.form.cancel}
            </Button>
          </div>
          {step < steps.length - 1 ? (
            <Button type="button" className="w-full sm:w-auto" onClick={handleNext}>
              Continuar
            </Button>
          ) : (
            <Button type="submit" className="w-full sm:w-auto" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Enviando...' : copy.form.submit}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
