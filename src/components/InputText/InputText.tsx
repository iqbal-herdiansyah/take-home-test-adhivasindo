import type { ChangeEvent } from "react";

import { IonIcon } from "@ionic/react";

import "./InputText.css";

interface InputTextProps {
	value?: string;
	icon?: string;
	placeholder?: string;
	onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const InputText: React.FC<InputTextProps> = ({ value, icon, placeholder, onChange }) => {
	return (
		<div className="input-text">
			{icon && <IonIcon icon={icon} />}
			<input value={value} placeholder={placeholder} onChange={onChange} />
		</div>
	);
};

export { InputText };
