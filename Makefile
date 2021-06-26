currentDir := $(shell pwd)

run:
	@echo "==> Running Blockade Checklist"
	@${currentDir}/scripts/runBlockadeChecklist.bat
.PHONY: run

init:
	@echo "==> Initializing Blockade Checklist"
	@${currentDir}/scripts/initBlockadeChecklist.bat
.PHONY: init

build:
	@echo "==> Building Blockade Checklist redbean webserver"
	@${currentDir}/scripts/buildRedBean.sh
.PHONY: build

git:
	@git add -u
	@git commit
	@git push origin
.PHONY: git

clean:
	@git clean -f
.PHONY: clean
