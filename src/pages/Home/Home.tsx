import { IonContent, IonPage } from "@ionic/react";
import { Navbar } from "../../components/Navbar/Navbar";
import { Board } from "./components/Board/Board";
import { useColumn } from "@/data/column/column";

import "./Home.css";

const Home: React.FC = () => {
	const { columns, setColumns, createTask, updateTask, deleteTask, filter, formatDueDate, setFilter } = useColumn();

	return (
		<IonPage>
			<Navbar filter={filter} setFilter={setFilter} />

			<IonContent fullscreen>
				<div className="content-container">
					<Board
						columns={columns}
						setColumns={setColumns}
						createTask={createTask}
						updateTask={updateTask}
						deleteTask={deleteTask}
						filter={filter}
						setFilter={setFilter}
						formatDueDate={formatDueDate}
					/>
				</div>
			</IonContent>
		</IonPage>
	);
};

export default Home;
