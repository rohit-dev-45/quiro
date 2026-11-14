"use client";

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { UsageDay } from "@/lib/usage";
import { Bar, BarChart, Cell, XAxis } from "recharts";

const config = {
    questions: { label: "Questions", color: "var(--brand)" },
} satisfies ChartConfig;

function dayLabel(date: string) {
    const [year, month, day] = date.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}

function shortLabel(date: string) {
    const [year, month, day] = date.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

function UsageChart({ days }: { days: UsageDay[] }) {
    const first = days.at(0);
    const last = days.at(-1);
    const busiest = Math.max(...days.map((day) => day.questions));

    return (
        <>
            <ChartContainer
                config={config}
                className="aspect-auto h-52 w-full [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-transparent"
            >
                <BarChart
                    data={days}
                    margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
                >
                    <XAxis dataKey="date" hide />

                    <ChartTooltip
                        cursor={false}
                        content={
                            <ChartTooltipContent
                                labelFormatter={(_, payload) =>
                                    dayLabel(
                                        String(
                                            payload?.[0]?.payload?.date ?? "",
                                        ),
                                    )
                                }
                                formatter={(value) =>
                                    `${value} ${value === 1 ? "Question" : "Questions"}`
                                }
                            />
                        }
                    />

                    <Bar
                        dataKey="questions"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={56}
                    >
                        {days.map((day, index) => (
                            <Cell
                                key={day.date}
                                className={
                                    index === days.length - 1
                                        ? "fill-brand"
                                        : "fill-brand/45"
                                }
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ChartContainer>

            <div className="mt-2 flex items-center justify-between font-mono text-xs text-muted-foreground">
                <span>{first ? shortLabel(first.date) : ""}</span>
                <span>{last ? shortLabel(last.date) : ""}</span>
            </div>
            <div className="sr-only">
                <table>
                    <caption>
                        Questions Asked Per Day Over The Last {days.length}{" "}
                        Days. Busiest Day: {busiest}.
                    </caption>
                    <thead>
                        <tr>
                            <th scope="col">Day</th>
                            <th scope="col">Questions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {days.map((day) => (
                            <tr key={day.date}>
                                <th scope="row">{dayLabel(day.date)}</th>
                                <td>{day.questions}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export { UsageChart };
