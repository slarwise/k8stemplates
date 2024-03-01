# Templates

Templates for resources I use often. Here's a script for listing the available
templates (give 0 arguments) or downloading a specific one.

```sh
#!/bin/bash

if [ $# -eq 0 ]; then
    URL="https://api.github.com/repos/slarwise/templates/contents/templates"
    curl --silent "$URL" | jq --raw-output '.[].name'
else
    URL="https://raw.githubusercontent.com/slarwise/templates/main/templates/${1}"
    curl --silent "$URL"
fi
```
