import { z } from "zod";

export const TaskSchema = z.object({
	id: z.string(),
	title: z.string().min(1, { message: "Title is required." }),
	description: z.string().min(1, { message: "Description is required." }),
	assignees: z.array(z.object()).min(1, { message: "Assignee is required." }),
	due_date: z.string().min(1, { message: "Due date is required." }),
	label: z.string().min(1, { message: "Label is required." }),
	priority: z.string(),
	checklist_items: z.array(
		z.object({
			id: z.string(),
			task_text: z.string(),
			is_completed: z.boolean(),
		}),
	),
	attachment_files: z.array(z.string()),
	column: z.enum(["To Do", "Doing", "Review", "Done", "Rework"]),
	cover_image: z
		.object({
			id: z.string(),
			image: z.string(),
		})
		.nullish(),
});

export type TaskSchema = z.infer<typeof TaskSchema>;
