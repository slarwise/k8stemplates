# k8stemplates

Kubernetes templates for resources I use often. Here's a script for listing the
available templates (give 0 arguments) or downloading a specific one (give the
resource kind as first argument).

```sh
#!/bin/bash

if [ $# -eq 0 ]; then
    URL="https://api.github.com/repos/slarwise/k8stemplates/contents/templates"
    curl --silent "$URL" | jq --raw-output '.[].name'
else
    URL="https://raw.githubusercontent.com/slarwise/k8stemplates/main/templates/${1}.yaml"
    curl --silent "$URL"
fi
```
