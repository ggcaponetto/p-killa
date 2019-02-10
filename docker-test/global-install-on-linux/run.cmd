docker build -f ./Dockerfile --tag ggcaponetto/p-killa-test-global-install-on-linux .
echo "built docker image ggcaponetto/p-killa-test-global-install-on-linux. running the bash in it.."
docker run -it ggcaponetto/p-killa-test-global-install-on-linux bash
