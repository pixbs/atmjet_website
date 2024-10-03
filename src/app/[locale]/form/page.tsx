"use server"

import { NextRequest } from "next/server";
import { FieldRow } from "./field_row";

export default async function Page(req : NextRequest) {
    console.log(req.body);
    
    return (
        <section>
            <h1>{}</h1>
            <div className="container pt-40">
                <form action={formAction} id="Form" className="flex flex-col gap-4">
                    <FieldRow/>
                    <button type="submit">Submit</button>
                </form>
            </div>
        </section>
    )
}

async function formAction(formData: FormData) {
    "use server";
    console.log(formData);
}