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
    serverReady: boolean,
    boxedChoices: boolean,
    excludeRationale: boolean,
    setFile: Dispatch<SetStateAction<File | null>>,
    setStrategy: Dispatch<SetStateAction<Strategy>>,
    setResults: Dispatch<SetStateAction<Result[]>>,
    setInvalidRows: Dispatch<SetStateAction<Result[]>>,
    setIsLoading: Dispatch<SetStateAction<boolean>>,
    setServerReady: Dispatch<SetStateAction<boolean>>,
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
    const [serverReady, setServerReady] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [boxedChoices, setBoxedChoices] = useState<boolean>(false)
    const [excludeRationale, setExcludeRationale] = useState<boolean>(false)
    const [lastPingTime, setLastPingTime] = useState<number | null>(null)
    
    const axios = http()

    const createForm = (file: File) => {
        const data = new FormData()
        
        data.append("file", file)
        data.append("strategy", strategy)
        if (boxedChoices) data.append("boxed_choices", "true")
        if (excludeRationale) data.append("exclude_rationale", "true")

        return data
    }

    const startServer = (timeoutSeconds: number = 180) => {
        const controller = new AbortController()

        return axios.get("/", {
            timeout: timeoutSeconds * 1000,
            signal: controller.signal
        })
    }

    const uploadFile = (file: File, timeoutSeconds: number = 180) => {
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
        startServer().then((_) => {
            setServerReady(true)
        })
    }, [])
    
    useEffect(() => {
        const wakeTimer = setTimeout(() => {
            startServer().then((_) => {
                setServerReady(true)
            }).catch((_) => {
                setServerReady(false)
            }).finally(() => {
                setLastPingTime(Math.floor(Date.now() / 1000))
            })
        }, 1000 * 60 * 2)

        return () => clearTimeout(wakeTimer)
    }, [lastPingTime])

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
            serverReady,
            boxedChoices,
            excludeRationale,
            setFile,
            setStrategy,
            setResults,
            setInvalidRows,
            setIsLoading,
            setServerReady,
            setBoxedChoices,
            setExcludeRationale,
            uploadFile,
            reset
        }
    }, [file, isLoading, results, strategy, boxedChoices, excludeRationale, invalidRows, serverReady])

    return (
        <ParserContext.Provider value={value}>
            {props.children}
        </ParserContext.Provider>
    );
}
