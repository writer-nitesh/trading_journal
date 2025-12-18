import { Brain } from 'lucide-react';

const getPriorityClass = (priority) => {
    switch (priority) {
        case 'high': return 'border-red-500 bg-red-50 text-red-600 dark:bg-red-900/50 dark:border-red-700';
        case 'medium': return 'border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-900/50 dark:border-orange-700';
        case 'low': return 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:border-blue-700';
        default: return 'border-neutral-300 bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:border-neutral-600';
    }
};

const MOCK_INSIGHTS = {
    insights: [
        { id: 1, title: "Risk Management Alert", description: "Your position sizing has been inconsistent in the last 10 trades. Consider implementing a fixed percentage risk model.", priority: "high", category: "Risk" },
        { id: 2, title: "Strategy Concentration", description: "70% of your winning trades are from the 'Breakout' strategy. Consider exploring other setups to diversify.", priority: "high", category: "Strategy" },
        { id: 3, title: "Direction Analysis", description: "Your best performing trades occur in the morning session. Avoid trading in the last hour of market.", priority: "medium", category: "Timing" },
        { id: 4, title: "Timing Analysis", description: "Your best performing trades occur in the morning session. Avoid trading in the last hour of market.", priority: "medium", category: "Timing" },
    ],
    tasks: [
        { id: 1, task: "Take risk of only ₹5,000 per day", category: "Risk Management", priority: "high" },
        { id: 2, task: "Only trade between 10:30-11:30 AM", category: "Timing", priority: "medium" },
        { id: 3, task: "Review trades daily for pattern analysis", category: "Analysis", priority: "low" },
    ]
};

const InsightCard = ({ insight }) => (
    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">{insight.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityClass(insight.priority)}`}>
                        {insight.priority}
                    </span>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">{insight.description}</p>
            </div>
        </div>
    </div>
);

export default function AiIsights() {
    return (
        <aside className="w-full lg:w-3/10 h-full  border-l border-neutral-200 dark:border-neutral-700 flex flex-col">
            <div className="p-4 lg:p-6 flex-1 overflow-y-auto">
                <h3 className="text-lg font-semibold flex items-center mb-4 dark:text-neutral-200"><Brain className="h-4 w-4 mr-2 text-purple-600" />AI Insights</h3>
                <div className="space-y-4">
                    {MOCK_INSIGHTS.insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)}
                </div>
            </div>
        </aside>
    )
}
