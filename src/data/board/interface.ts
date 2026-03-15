import type { User } from "../user/interface";

export interface Column {
	id: string;
	title: string;
}

export type TaskLabel = "Feature" | "Bug" | "Issue" | "Undefined";
export type TaskPriority = "High" | "Medium" | "Low";

export interface TaskChecklist {
	id: string;
	task_text: string;
	is_completed: boolean;
}

export interface TaskMember {
	id: string;
	full_name: string;
	avatar_url: string;
}

export interface Task {
	id: string;
	title: string;
	description: string;
	assignees: User[];
	due_date: string;
	label: TaskLabel;
	priority?: TaskPriority;
	checklist_items: TaskChecklist[];
	attachment_files: string[];
	column_id: string;
	order: number;
}
