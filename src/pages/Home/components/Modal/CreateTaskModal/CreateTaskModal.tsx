import type { Column, TaskChecklist } from "@/data/column/interface";

import dayjs from "dayjs";
import { ChangeEvent, FormEvent, useCallback, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useForm, Controller } from "react-hook-form";
import { TaskSchema } from "@/pages/Home/schemas/task-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@/data/user/user";

import {
	IonAvatar,
	IonButton,
	IonCheckbox,
	IonDatetime,
	IonDatetimeButton,
	IonIcon,
	IonItem,
	IonModal,
	IonProgressBar,
	IonSelect,
	IonSelectOption,
	useIonToast,
} from "@ionic/react";

import {
	addOutline,
	calendarOutline,
	checkmarkOutline,
	closeOutline,
	imageOutline,
	removeOutline,
} from "ionicons/icons";

import "./CreateTaskModal.css";
import { AvatarGroup } from "@/components/AvatarGroup/AvatarGroup";
import { convertBlobToBase64 } from "@/utils/convert-blob-to-base64";

interface CreateTaskModalProps {
	columns: Column;
	currentColumn: keyof Column;
	onCreateTask: (payload: TaskSchema) => void;
	onDiscard: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ columns, currentColumn, onCreateTask, onDiscard }) => {
	const { users } = useUser();

	const assigneeModalRef = useRef<HTMLIonSelectElement>(null);
	const coverImageInputRef = useRef<HTMLInputElement>(null);

	const [isShowChecklistInput, setShowChecklistInput] = useState<boolean>(false);
	const [checklistText, setChecklistText] = useState<string>("");

	const [presentToast] = useIonToast();

	const taskForm = useForm<TaskSchema>({
		resolver: zodResolver(TaskSchema),
		defaultValues: {
			id: uuidv4(),
			title: "",
			description: "",
			assignees: [],
			due_date: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
			label: "Feature",
			priority: "Low",
			checklist_items: [],
			attachment_files: [],
			column: currentColumn,
		},
	});

	const handleAddChecklist = useCallback(() => {
		const checklistTemp = [...taskForm.getValues().checklist_items];

		checklistTemp.push({
			id: uuidv4(),
			is_completed: false,
			task_text: checklistText,
		});

		taskForm.setValue("checklist_items", checklistTemp);

		setShowChecklistInput(false);
		setChecklistText("");
	}, [taskForm, checklistText, setShowChecklistInput, setChecklistText]);

	const handleChangeChecklistChecked = useCallback(
		(checked: boolean, index: number) => {
			const checklistTemp = [...taskForm.getValues().checklist_items];

			checklistTemp[index].is_completed = checked;

			taskForm.setValue("checklist_items", checklistTemp);
		},
		[taskForm],
	);

	const handleRemoveChecklistItem = useCallback(
		(id: string) => {
			const checklistTemp = taskForm.getValues().checklist_items;
			const newChecklist = checklistTemp.filter((t) => t.id !== id);

			taskForm.setValue("checklist_items", newChecklist);
		},
		[taskForm],
	);

	const getCompletedChecklist = useCallback(
		(checklists: TaskChecklist[]) => checklists.filter((t) => t.is_completed),
		[],
	);

	const handleCoverImageInputChange = useCallback(
		async (event: ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];

			if (!file) return;

			try {
				const tempUrl = URL.createObjectURL(file);
				const response = await fetch(tempUrl);
				const blob = await response.blob();

				const base64Data = await convertBlobToBase64(blob);

				taskForm.setValue("cover_image", {
					id: uuidv4(),
					image: base64Data,
				});
			} catch (error) {
				console.error(error);
			}
		},
		[taskForm],
	);

	const handleSave = useCallback(
		(event: FormEvent) => {
			event.preventDefault();

			onCreateTask(taskForm.getValues());
			onDiscard();

			presentToast({
				message: "Task created successfully.",
				duration: 1500,
				position: "bottom",
				color: "success",
				cssClass: "task-toast-success",
			});
		},
		[taskForm, presentToast],
	);

	return (
		<div className="create-task-modal">
			<form onSubmit={handleSave} className="create-task-modal-content">
				<div className="create-task-modal-left">
					<div className="create-task-modal-left-content">
						<div className="input-cover-image-field">
							<Controller
								control={taskForm.control}
								name="cover_image"
								render={({ field }) => (
									<>
										{field.value ? (
											<div className="cover_image_preview">
												<img src={field.value.image} />
											</div>
										) : (
											<>
												<IonIcon icon={imageOutline} slot="start" />

												<IonButton
													type="button"
													fill="clear"
													onClick={() => {
														coverImageInputRef.current?.click();
													}}
												>
													Add Cover Image
												</IonButton>

												<input
													ref={coverImageInputRef}
													type="file"
													accept="image/*"
													style={{ display: "none" }}
													onChange={handleCoverImageInputChange}
												/>
											</>
										)}
									</>
								)}
							/>
						</div>

						<hr />

						<div className="primary-field-section">
							<div className="title-field">
								<Controller
									control={taskForm.control}
									name="title"
									render={({ field }) => <input {...field} placeholder="Title" />}
								/>
							</div>

							<div className="primary-task-fields">
								<div className="field assignee-field">
									<label>Assignee</label>

									<div>
										<Controller
											control={taskForm.control}
											name="assignees"
											render={({ field }) => (
												<>
													<AvatarGroup items={field.value} itemKey="id" imageKey="image" limit={4} />

													<IonSelect
														ref={assigneeModalRef}
														value={field.value}
														multiple={true}
														style={{ display: "none" }}
														compareWith={(a, b) => a.id === b.id}
														onIonChange={(e) => field.onChange(e.detail.value)}
													>
														{users.map((user) => (
															<IonSelectOption key={user.id} value={user}>
																<IonAvatar slot="end" style={{ width: "30px", height: "30px" }}>
																	<img src={user.image} />
																</IonAvatar>

																{user.name}
															</IonSelectOption>
														))}
													</IonSelect>
												</>
											)}
										/>

										<IonButton
											shape="round"
											color="medium"
											onClick={() => {
												assigneeModalRef.current?.open();
											}}
										>
											<IonIcon icon={addOutline} slot="icon-only" />
										</IonButton>
									</div>
								</div>

								<div className="field due-date-field">
									<label>Due Date</label>

									<Controller
										control={taskForm.control}
										name="due_date"
										render={({ field }) => (
											<>
												<IonItem button lines="none">
													<IonIcon icon={calendarOutline} slot="end" />
													<IonDatetimeButton datetime="due-date-input" />
												</IonItem>

												<IonModal keepContentsMounted={true} className="due-date-input-modal">
													<IonDatetime
														id="due-date-input"
														value={field.value}
														onIonChange={(e) => field.onChange(e.detail.value)}
														presentation="date"
														formatOptions={{
															date: {
																day: "2-digit",
																month: "short",
																year: "numeric",
															},
														}}
													/>
												</IonModal>
											</>
										)}
									/>
								</div>

								<div className="field">
									<label>Board</label>

									<IonSelect value="board-example" interface="popover" fill="solid">
										<IonSelectOption value="board-example">Board</IonSelectOption>
									</IonSelect>
								</div>

								<div className="field">
									<label>Column</label>

									<Controller
										control={taskForm.control}
										name="column"
										render={({ field }) => (
											<IonSelect
												value={field.value}
												interface="popover"
												fill="solid"
												onIonChange={(e) => field.onChange(e.detail.value)}
											>
												{Object.entries(columns).map(([column]) => (
													<IonSelectOption key={column} value={column}>
														{column}
													</IonSelectOption>
												))}
											</IonSelect>
										)}
									/>
								</div>

								<div className="field">
									<label>Label</label>

									<Controller
										control={taskForm.control}
										name="label"
										render={({ field }) => (
											<IonSelect
												value={field.value}
												interface="popover"
												fill="solid"
												onIonChange={(e) => field.onChange(e.detail.value)}
											>
												<IonSelectOption value="Feature">Feature</IonSelectOption>
												<IonSelectOption value="Issue">Issue</IonSelectOption>
												<IonSelectOption value="Bug">Bug</IonSelectOption>
												<IonSelectOption value="Undefined">Undefined</IonSelectOption>
											</IonSelect>
										)}
									/>
								</div>

								<div className="field">
									<label>Priority</label>

									<Controller
										control={taskForm.control}
										name="priority"
										render={({ field }) => (
											<IonSelect
												value={field.value}
												interface="popover"
												fill="solid"
												onIonChange={(e) => field.onChange(e.detail.value)}
											>
												<IonSelectOption value="High">High</IonSelectOption>
												<IonSelectOption value="Medium">Medium</IonSelectOption>
												<IonSelectOption value="Low">Low</IonSelectOption>
											</IonSelect>
										)}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="create-task-modal-right">
					<div className="create-task-modal-right-content">
						<div className="input-field">
							<label className="input-label">Description</label>

							<Controller
								control={taskForm.control}
								name="description"
								render={({ field }) => <textarea {...field} rows={5} className="input-area" />}
							/>
						</div>

						<hr />

						<div className="input-field attachments-field">
							<label className="input-label">Attachments</label>

							<div>
								<IonIcon icon={imageOutline} />
								<p>
									Drag & Drop files here <span>Or</span> <span>browse from device</span>
								</p>
							</div>
						</div>

						<hr />

						<div className="input-field checklist-field">
							<label className="input-label">Check List</label>

							<Controller
								control={taskForm.control}
								name="checklist_items"
								render={({ field }) => (
									<>
										<div className="input-checklist-progress">
											{getCompletedChecklist(field.value).length}/{field.value.length}
											<IonProgressBar
												value={
													getCompletedChecklist(field.value).length > 0
														? getCompletedChecklist(field.value).length / field.value.length
														: 0
												}
											/>
										</div>

										<div className="checklists">
											{field.value.map((checklist, index) => (
												<div key={checklist.id} className="checklist-item">
													<IonCheckbox
														key={checklist.id}
														checked={checklist.is_completed}
														labelPlacement="end"
														onIonChange={(e) => {
															handleChangeChecklistChecked(e.detail.checked, index);
														}}
													>
														{checklist.task_text}
													</IonCheckbox>

													<IonButton
														type="button"
														color="warning"
														onClick={() => {
															handleRemoveChecklistItem(checklist.id);
														}}
													>
														<IonIcon icon={removeOutline} slot="icon-only" />
													</IonButton>
												</div>
											))}
										</div>

										<IonButton type="button" color="medium" onClick={() => setShowChecklistInput(true)}>
											<IonIcon icon={addOutline} slot="start" />
											Add substask
										</IonButton>

										{isShowChecklistInput && (
											<div className="create-new-checklist-section">
												<input
													value={checklistText}
													placeholder="New Task"
													onChange={(e) => setChecklistText(e.target.value)}
												/>

												<IonButton
													type="button"
													color="warning"
													onClick={() => {
														setShowChecklistInput(false);
													}}
												>
													<IonIcon icon={closeOutline} slot="icon-only" />
												</IonButton>

												<IonButton type="button" onClick={handleAddChecklist}>
													<IonIcon icon={checkmarkOutline} slot="icon-only" />
												</IonButton>
											</div>
										)}
									</>
								)}
							/>
						</div>

						<hr />

						{/* <div className="input-field">
							<label className="input-label">Activity</label>
						</div> */}
					</div>

					<div className="create-task-modal-actions">
						<IonButton type="button" color="medium" onClick={onDiscard} className="create-task-modal-discard-button">
							Discard
						</IonButton>

						<IonButton type="submit" className="create-task-modal-save-button">
							Save
						</IonButton>
					</div>
				</div>
			</form>
		</div>
	);
};

export { CreateTaskModal };
