param([Parameter(ValueFromRemainingArguments=$true)][string[]]$GitArguments)
$env:GIT_OBJECT_DIRECTORY = 'C:\Users\Skyler B. Brown\Desktop\dew-theory-codex\.revamp-git-objects'
$env:GIT_ALTERNATE_OBJECT_DIRECTORIES = 'D:\OffloadedProjects\dew-theory\.git\objects'
New-Item -ItemType Directory -Path $env:GIT_OBJECT_DIRECTORY -Force | Out-Null
& git -c 'safe.directory=C:/Users/Skyler B. Brown/Desktop/dew-theory-codex' @GitArguments
exit $LASTEXITCODE
