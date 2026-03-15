import type { User } from "../user/interface";

export type ColumnName = "To Do" | "Doing" | "Review" | "Done" | "Rework";

export type Column = Record<ColumnName, Task[]>;

export type TaskLabel = "Feature" | "Bug" | "Issue" | "Undefined";
export type TaskPriority = "High" | "Medium" | "Low";

export interface CoverImage {
	id: string;
	image: string;
}

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
	cover_image?: CoverImage | null;
}

export interface ColumnFilter {
	keyword: string;
	userIds: string[];
}
