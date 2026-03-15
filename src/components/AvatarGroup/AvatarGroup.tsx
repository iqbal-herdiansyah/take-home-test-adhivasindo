import { useMemo } from "react";

import { IonAvatar } from "@ionic/react";

import "./AvatarGroup.css";

interface AvatarGroupProps {
	items: any[];
	itemKey: string;
	imageKey: string;
	limit: number;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({ items, itemKey, imageKey, limit }) => {
	const hasMore = useMemo(() => items.length > limit, [items, limit]);
	const remainingCount = useMemo(() => items.length - limit, [items, limit]);

	const slicedItems = useMemo(() => items.slice(0, limit), [items, limit]);

	return (
		<div className="avatar-group">
			{slicedItems.map((item) => (
				<IonAvatar key={item[itemKey]}>
					<img src={item[imageKey]} />
				</IonAvatar>
			))}
			{hasMore && (
				<IonAvatar>
					<div className="avatar-excess-count">
						<p>+{remainingCount}</p>
					</div>
				</IonAvatar>
			)}
		</div>
	);
};

export { AvatarGroup };
