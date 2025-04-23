import { createContext, useEffect, useMemo, useState } from "react";
import { http, type AxiosResponse } from "@/lib/http";

import type { Dispatch, SetStateAction, PropsWithChildren } from "react"

export type Result = {
    question_number: string,
    question_text: string,
    answer: string,
    choices: string[],
    rationale?: string[]
}

type AnalyzeResponse = {
    results: Result[],
    invalid: Result[]
}

export type Strategy = "triplecolumn" | "standard" | "pymupdf"

type ParserContextType = {
    file: File | null,
    strategy: Strategy,
    results: Result[],
    invalidRows: Result[],
    isLoading: boolean,
    boxedChoices: boolean,
    excludeRationale: boolean,
    setFile: Dispatch<SetStateAction<File | null>>,
    setStrategy: Dispatch<SetStateAction<Strategy>>,
    setResults: Dispatch<SetStateAction<Result[]>>,
    setInvalidRows: Dispatch<SetStateAction<Result[]>>,
    setIsLoading: Dispatch<SetStateAction<boolean>>,
    setBoxedChoices: Dispatch<SetStateAction<boolean>>,
    setExcludeRationale: Dispatch<SetStateAction<boolean>>,
    uploadFile: (file: File) => Promise<AxiosResponse<AnalyzeResponse, any>>,
    reset: () => void,
}

export const ParserContext = createContext<ParserContextType | undefined>(undefined)

export function ParserProvider(props: PropsWithChildren) {
    const [file, setFile] = useState<File | null>(null)
    const [strategy, setStrategy] = useState<Strategy>("standard")
    const [results, setResults] = useState<Result[]>([])
    const [invalidRows, setInvalidRows] = useState<Result[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [boxedChoices, setBoxedChoices] = useState<boolean>(false)
    const [excludeRationale, setExcludeRationale] = useState<boolean>(false)
    
    const axios = http()

    const createForm = (file: File) => {
        const data = new FormData()
        
        data.append("file", file)
        data.append("strategy", strategy)
        if (boxedChoices) data.append("boxed_choices", "true")
        if (excludeRationale) data.append("exclude_rationale", "true")

        return data
    } 

    const uploadFile = (file: File, timeoutSeconds: number = 30) => {
        // prevent premature aborts on Firefox
        const controller = new AbortController()

        return axios.post<AnalyzeResponse>(
            "/analyze", 
            createForm(file), {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                timeout: timeoutSeconds * 1000,
                signal: controller.signal
            }
        )
    }

    const reset = () => {
        setFile(null)
        setResults([])
        setInvalidRows([])
        setIsLoading(false)
    }

    useEffect(() => {
        if (file === null) {
            return
        }

        setIsLoading(true)

        uploadFile(file)
            .then((res) => {
                if (res.data) {
                    setResults(res.data.results ?? [])
                    setInvalidRows(res.data.invalid ?? [])
                }
            }).catch((err) => {
                console.error(err)

                if (err.name === "AbortError") {
                    console.error("Aborted")
                }

                setFile(null)
                setResults([])
                setInvalidRows([])
            }).finally(() => {
                setIsLoading(false)
            })
    }, [file])

    const value = useMemo<ParserContextType>(() => {
        return {
            file,
            strategy,
            results,
            invalidRows,
            isLoading,
            boxedChoices,
            excludeRationale,
            setFile,
            setStrategy,
            setResults,
            setInvalidRows,
            setIsLoading,
            setBoxedChoices,
            setExcludeRationale,
            uploadFile,
            reset
        }
    }, [file, isLoading, results, strategy, boxedChoices, excludeRationale, invalidRows])

    return (
        <ParserContext.Provider value={value}>
            {props.children}
        </ParserContext.Provider>
    );
}