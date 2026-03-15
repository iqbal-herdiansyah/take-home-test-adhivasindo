const convertBlobToBase64 = async (blob: Blob): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onerror = reject;

		reader.onload = () => {
			const base64String = reader.result as string;

			resolve(base64String);
		};

		reader.readAsDataURL(blob);
	});
};

export { convertBlobToBase64 };
