import { 
    Sidebar, 
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarRail,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton
} from "@/components/ui/sidebar"
import { 
    Select, 
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectLabel,
    SelectItem
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useParser, type Strategy } from "@/app/providers/parser";

type OptionRowProps = {
    id: string;
    label: string;
    className?: string;
    onChange?: (value: any) => void
}

function OptionRow(props: OptionRowProps) {
    return (
        <div className={cn("flex items-center space-x-2", props.className)}>
            <Checkbox 
                id={props.id}
                onCheckedChange={props.onChange} 
            />
            <label 
                htmlFor={props.id} 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                {props.label}
            </label>
        </div>
    )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { setStrategy, setBoxedChoices, setExcludeRationale, ...parser } = useParser()

    const setParsingStrategy = (value: Strategy) => {
        setStrategy(value)
    }

    return (
        <Sidebar {...props}>
            <SidebarHeader className="h-16 border-b border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" className="">
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">vcegen-client</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="p-2 [&>*]:my-2">
                <div>
                    <Label className="font-semibold text-sm mb-2 block leading-tight">
                        Parsing Strategy
                    </Label>
                    <Select onValueChange={setParsingStrategy} defaultValue="standard">
                        <SelectTrigger>
                            <SelectValue placeholder="Select Strategy" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Strategy</SelectLabel>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="pymupdf">PyMuPDF</SelectItem>
                                <SelectItem value="triplecolumn">Triple Column</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className="font-semibold text-sm mb-2 block leading-tight">
                        Options
                    </Label>
                    <div className="[&>*]:my-4">
                        <OptionRow 
                            id="boxed-choices"
                            label="Boxed Choices"
                            onChange={setBoxedChoices}
                        />
                        <OptionRow 
                            id="exclude-rationale"
                            label="Exclude Rationale"
                            onChange={setExcludeRationale}
                        />
                    </div>
                </div>
                <div>
                    <Label className="font-semibold text-sm mb-2 block leading-tight">
                        Results
                    </Label>
                    {
                        (!parser.file && !parser.isLoading) ? (
                            <p className="text-sm">No file attached to staging area</p>
                        ) : (
                            <p className="text-sm">
                                <span className="font-semibold tracking-tight">Detected Invalid: </span>
                                {parser.invalidRows.length}
                            </p>
                        )
                    }
                </div>
            </SidebarContent>
            <SidebarFooter>
                {/*<UploadFileButton />*/}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}