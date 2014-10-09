
default:
	@echo "Do you mean:    make deploy        ?"

deploy:
	cd site; rsync -avvR --exclude '*~' --exclude '.git' * podlogin.org:/sites/podlogin.org
