function LoadingStep(label, type, execute) {
	if (type !== "sync" && type !== "assync")
		throw new Error("Unhandled input");
	this.label = label;
	this.execute = execute;
}