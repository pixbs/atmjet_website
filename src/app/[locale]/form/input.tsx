import { InputHTMLAttributes } from "react";

export function Input(props : InputHTMLAttributes<HTMLInputElement>) {
    const listId = `${props.id}-list`;

    return (
        <div className="relative">
            <label htmlFor={props.id} className="absolute left-6 top-5 text-sm font-semibold text-gray-500 z-10">
                {props.placeholder}
            </label>
            <input {...props} className="px-6 pb-5 pt-10 rounded-sm" list={listId}/>
        </div>
    )
}