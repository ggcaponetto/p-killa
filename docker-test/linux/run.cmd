rd context /s /q
echo "cleaned up docker context"
echo D | xcopy ".\..\..\dist" "context\dist" /s /e
echo D | xcopy ".\..\..\scripts" "context\scripts" /s /e
echo D | xcopy ".\..\..\src" "context\src" /s /e
echo D | xcopy ".\..\..\test" "context\test" /s /e
xcopy ".\..\..\**" context
echo "copied project files into docker context"
docker build -f ./Dockerfile --tag ggcaponetto/p-killa-test-linux .
echo "built docker image ggcaponetto/p-killa-test-linux. running the bash in it.."
docker run -it ggcaponetto/p-killa-test-linux bash
