import type { User } from "./interface";

import { useState } from "react";
import dummy from "./dummy.json";

const useUser = () => {
	const [users] = useState<User[]>([...dummy]);

	return {
		users,
	};
};

export { useUser };
