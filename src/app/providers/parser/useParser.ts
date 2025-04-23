import { useContext } from "react";
import { ParserContext } from "./ParserProvider";

export function useParser() {
    const context = useContext(ParserContext)

    if (!context) {
        throw new Error("useParser must be used within a ParserProvider")
    }

    return context
}