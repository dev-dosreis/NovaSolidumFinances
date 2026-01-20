import { copy } from '../../content/copy';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { FormValues } from './types';

interface ReviewStepProps {
  values: FormValues;
  accountType: FormValues['accountType'];
  onEdit: (step: number) => void;
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function ReviewCard({
  title,
  onEdit,
  children,
  className,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('space-y-4 border-border/60 p-6', className)}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
          Editar
        </Button>
      </div>
      <div className="space-y-3">{children}</div>
    </Card>
  );
}

export function ReviewStep({ values, accountType, onEdit }: ReviewStepProps) {
  const isPF = accountType === 'PF';

  return (
    <div className="space-y-6">
      {isPF ? (
        <ReviewCard title={copy.form.pfSection} onEdit={() => onEdit(1)}>
          <ReviewRow label={copy.form.fullName} value={values.fullName} />
          <ReviewRow label={copy.form.cpf} value={values.cpf} />
          <ReviewRow label={copy.form.birthDate} value={values.birthDate} />
          <ReviewRow label={copy.form.rg} value={values.rg} />
          <ReviewRow label={copy.form.cnh} value={values.cnh} />
          <ReviewRow label={copy.form.email} value={values.userEmail} />
          <ReviewRow label={copy.form.phone} value={values.userPhone} />
          {values.pepStatus ? <p className="text-sm">{copy.form.pep}</p> : null}
          <ReviewRow label={copy.form.pepPosition} value={values.pepPosition} />
        </ReviewCard>
      ) : (
        <ReviewCard title={copy.form.companySection} onEdit={() => onEdit(1)}>
          <ReviewRow label={copy.form.companyName} value={values.companyName} />
          <ReviewRow label={copy.form.tradeName} value={values.tradeName} />
          <ReviewRow label={copy.form.cnpj} value={values.cnpj} />
          <ReviewRow label={copy.form.foundationDate} value={values.foundationDate} />
          <ReviewRow label={copy.form.cnae} value={values.mainCNAE} />
          <ReviewRow label={copy.form.companyEmail} value={values.companyEmail} />
          <ReviewRow label={copy.form.companyPhone} value={values.companyPhone} />
          <ReviewRow label={copy.form.legalNature} value={values.legalNature} />
        </ReviewCard>
      )}

      <ReviewCard
        title={isPF ? copy.form.addressSection : copy.form.fiscalAddress}
        onEdit={() => onEdit(2)}
      >
        {isPF ? (
          values.isForeigner ? (
            <>
              <ReviewRow label={copy.form.foreignStreet} value={values.foreignStreet} />
              <ReviewRow label={copy.form.foreignNumber} value={values.foreignNumber} />
              <ReviewRow label={copy.form.foreignComplement} value={values.foreignComplement} />
              <ReviewRow label={copy.form.foreignDistrict} value={values.foreignDistrict} />
              <ReviewRow label={copy.form.foreignCity} value={values.foreignCity} />
              <ReviewRow label={copy.form.foreignState} value={values.foreignState} />
              <ReviewRow label={copy.form.foreignZip} value={values.foreignZipCode} />
              <ReviewRow label={copy.form.foreignCountry} value={values.foreignCountry} />
            </>
          ) : (
            <>
              <ReviewRow label={copy.form.cep} value={values.cep} />
              <ReviewRow label={copy.form.street} value={values.street} />
              <ReviewRow label={copy.form.number} value={values.number} />
              <ReviewRow label={copy.form.complement} value={values.complement} />
              <ReviewRow label={copy.form.district} value={values.district} />
              <ReviewRow label={copy.form.city} value={values.city} />
              <ReviewRow label={copy.form.state} value={values.state} />
            </>
          )
        ) : (
          <>
            <ReviewRow label={copy.form.cep} value={values.pjCep} />
            <ReviewRow label={copy.form.street} value={values.pjStreet} />
            <ReviewRow label={copy.form.number} value={values.pjNumber} />
            <ReviewRow label={copy.form.complement} value={values.pjComplement} />
            <ReviewRow label={copy.form.district} value={values.pjDistrict} />
            <ReviewRow label={copy.form.city} value={values.pjCity} />
            <ReviewRow label={copy.form.state} value={values.pjState} />
          </>
        )}
      </ReviewCard>

      {isPF ? (
        <ReviewCard title={copy.form.documentsSection} onEdit={() => onEdit(3)}>
          <ReviewRow label={copy.form.docFront} value={values.documentFront?.name} />
          <ReviewRow label={copy.form.docBack} value={values.documentBack?.name} />
          <ReviewRow label={copy.form.selfie} value={values.selfie?.name} />
          <ReviewRow label={copy.form.proofOfAddress} value={values.proofOfAddress?.name} />
        </ReviewCard>
      ) : (
        <>
          <ReviewCard title={copy.form.adminSection} onEdit={() => onEdit(2)}>
            <ReviewRow label={copy.form.adminName} value={values.majorityAdminName} />
            <ReviewRow label={copy.form.adminCpf} value={values.majorityAdminCpf} />
            <ReviewRow label={copy.form.adminEmail} value={values.majorityAdminEmail} />
            <ReviewRow label={copy.form.adminPhone} value={values.majorityAdminPhone} />
          </ReviewCard>
          <ReviewCard title={copy.form.companyDocsSection} onEdit={() => onEdit(3)}>
            <ReviewRow label={copy.form.articles} value={values.articlesOfAssociation?.name} />
            <ReviewRow label={copy.form.cnpjCard} value={values.cnpjCard?.name} />
            <ReviewRow label={copy.form.adminIdFront} value={values.adminIdFront?.name} />
            <ReviewRow label={copy.form.adminIdBack} value={values.adminIdBack?.name} />
            <ReviewRow label={copy.form.companyProof} value={values.companyProofOfAddress?.name} />
            <ReviewRow label={copy.form.ecnpj} value={values.ecnpjCertificate?.name} />
          </ReviewCard>
        </>
      )}
    </div>
  );
}
