import { InputHTMLAttributes } from "react";

export function Counter(props : InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className="flex-row items-center gap-1 bg-gray-900 px-6 rounded-sm">
            <label htmlFor={props.id} className="text-sm font-semibold text-gray-500">Passengers</label>
            <button className={`size-8 rounded-lg border border-gray-700 p-0`}>
                -
            </button>
            <input pattern="^(?:\d|1[0-6])$" min={0} max={16} defaultValue={0} name="counter" className="w-10 border-none bg-transparent stroke-none p-0 py-1 text-center focus:stroke-none" {...props}/>
            <button className={`size-8 rounded-lg border border-gray-700 p-0`}>
                +
            </button>
        </div>
    )
}