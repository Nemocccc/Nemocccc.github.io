import { Skeleton } from "@/components/ui/skeleton"

export default function frame() {
    return (
        <div>
            <div className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-[250px] rounded-xl text-justfy">
                <div className="text-xs mx-4">
                </div>
            </Skeleton>
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
            </div>
        </div>
    )
}