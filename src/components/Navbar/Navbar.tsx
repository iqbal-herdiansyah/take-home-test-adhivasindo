import { IonButton, IonHeader, IonIcon, IonSelect, IonSelectOption } from "@ionic/react";
import {
	lockClosedOutline,
	chevronDown,
	personAddOutline,
	filterOutline,
	globeOutline,
	searchOutline,
} from "ionicons/icons";
import { AvatarGroup } from "../AvatarGroup/AvatarGroup";

import { useUser } from "@/data/user/user";

import "./Navbar.css";
import { InputText } from "../InputText/InputText";
import { useColumn } from "@/data/column/column";
import { useRef } from "react";

interface NavbarProps extends Pick<ReturnType<typeof useColumn>, "filter" | "setFilter"> {}

const Navbar: React.FC<NavbarProps> = ({ filter, setFilter }) => {
	const userFilterRef = useRef<HTMLIonSelectElement>(null);

	const { users } = useUser();

	return (
		<IonHeader>
			<div className="nav-toolbar-content">
				<div>
					<IonButton fill="clear" color="dark" size="small" className="logo-button">
						<IonIcon icon={lockClosedOutline} slot="start" />
						Adhivasindo
						<IonIcon icon={chevronDown} slot="end" />
					</IonButton>

					<AvatarGroup items={users} itemKey="id" imageKey="image" limit={4} />

					<IonButton size="small" color="medium">
						<IonIcon icon={personAddOutline} slot="start" />
						Invite
					</IonButton>
				</div>

				<div>
					<div>
						<IonSelect
							ref={userFilterRef}
							value={filter.userIds}
							multiple={true}
							style={{ display: "none" }}
							compareWith={(a, b) => a === b}
							onIonChange={(e) => setFilter((f) => ({ ...f, userIds: e.detail.value }))}
						>
							{users.map((user) => (
								<IonSelectOption key={user.id} value={user.id}>
									{user.name}
								</IonSelectOption>
							))}
						</IonSelect>

						<IonButton
							size="small"
							fill="clear"
							color="dark"
							onClick={() => {
								userFilterRef.current?.open();
							}}
						>
							<IonIcon icon={filterOutline} slot="start" />
							Filter
						</IonButton>
					</div>

					<IonButton size="small" fill="clear" color="dark">
						<IonIcon icon={globeOutline} slot="start" />
						Export/Import
					</IonButton>

					<InputText
						value={filter.keyword}
						icon={searchOutline}
						placeholder="Search Tasks"
						onChange={(e) => setFilter((f) => ({ ...f, keyword: e.target.value }))}
					/>
				</div>
			</div>
		</IonHeader>
	);
};

export { Navbar };
