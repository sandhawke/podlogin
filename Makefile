
default:
	@echo "Do you mean:    make deploy        ?"

deploy:
	cd site; rsync -avvR --exclude '*~' --exclude '.git' * podlogin.org:/sites/podlogin.org; cd 0.1.1; rsync -avv _login_iframe.html _login_iframe.js root@fakepods.com:/root/static
