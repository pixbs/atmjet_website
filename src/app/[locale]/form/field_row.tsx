import { useTranslations } from "next-intl";
import { DetailedHTMLProps, HTMLAttributes } from "react";
import { AutoComplete } from "./autocomplete";
import { Counter } from "./counter";
import { Input } from "./input";

export function FieldRow(props : DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
    const t = useTranslations('form')
    
    return <div className="flex-row gap-1" {...props}>
                    <AutoComplete 
                        placeholder={t('from')}
                        name={`${props.key}-depart`}
                        id={`${props.key}-from`}
                        required
                    />
                    <AutoComplete 
                        placeholder={t('to')}
                        name={`${props.key}-depart`}
                        id={`${props.key}-to`}
                        required
                    />
                    <Input
                        placeholder={t('depart')}
                        name={`${props.key}-depart`}
                        id={`${props.key}-depart`}
                        type="date"
                        required
                    />
                    <Input
                        placeholder={t('return')}
                        name={`${props.key}-depart`}
                        id={`${props.key}-return`}
                        type="date"
                        required
                    />
                    <Counter
                        placeholder={t('passengers')}
                        id={`${props.key}-passengers`}
                        name={`${props.key}-passengers`}
                    />
    </div>
}