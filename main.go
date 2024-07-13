package main

import (
	"fmt"
	"html/template"
	"os"
	"path"
	"strings"
)

func fatal(format string, a ...string) {
	if !strings.HasSuffix(format, "\n") {
		format += "\n"
	}
	fmt.Fprintf(os.Stderr, format, a)
	os.Exit(1)
}

func main() {
	templatesDir := "templates"
	templateFiles, err := os.ReadDir(templatesDir)
	if err != nil {
		fatal("Could not read templates dir: %s", err.Error())
	}
	templates := []Template{}
	availableTemplates := [][]string{}
	for _, t := range templateFiles {
		if t.IsDir() {
			continue
		}
		filePath := path.Join(templatesDir, t.Name())
		contents, err := os.ReadFile(filePath)
		if err != nil {
			fatal("Could not read template %s: %s", filePath, err.Error())
		}
		id := strings.TrimSuffix(t.Name(), ".tmpl")
		template := parseTemplate(id, string(contents))
		templates = append(templates, template)

		availableTemplates = append(availableTemplates, []string{template.Id, template.Name})
	}
	values := []Value{}
	for _, t := range templates {
		values = append(values, Value{
			Template:           t,
			AvailableTemplates: availableTemplates,
		})
	}
	outputDir := "public"
	err = os.MkdirAll(outputDir, 0755)
	if err != nil {
		fatal("Could not create %s dir: %s", outputDir, err.Error())
	}

	indexTemplate := template.Must(template.ParseFiles("index.tmpl"))
	indexPath := path.Join(outputDir, "index.html")
	indexOutput, err := os.Create(indexPath)
	if err != nil {
		fatal("Could not create file %s: %s", indexPath, err.Error())
	}
	indexTemplate.Execute(indexOutput, availableTemplates)
	templateTemplate := template.Must(template.ParseFiles("template.tmpl"))
	for _, t := range values {
		filePath := path.Join(outputDir, t.Id+".html")
		output, err := os.Create(filePath)
		if err != nil {
			fatal("Could not create file %s: %s", filePath, err.Error())
		}
		templateTemplate.Execute(output, t)
	}
	if err = copyFile("index.js", path.Join(outputDir, "index.js")); err != nil {
		fatal("Failed to copy index.js: %s", err.Error())
	}
	if err = copyFile("favicon.ico", path.Join(outputDir, "favicon.ico")); err != nil {
		fatal("Failed to copy favicon.ico: %s", err.Error())
	}
}

type Template struct {
	Id     string
	Name   string
	Inputs [][]string
	Text   string
}

type Value struct {
	Template
	AvailableTemplates [][]string
}

func parseTemplate(id, contents string) Template {
	lines := strings.Split(contents, "\n")
	t := Template{
		Id:     id,
		Name:   lines[0],
		Inputs: [][]string{},
		Text:   "",
	}
	lines = lines[1:]
	for i, line := range lines {
		if line == "" {
			lines = lines[i+1:]
			break
		}
		split := strings.Split(line, "=")
		key := strings.TrimSpace(split[0])
		defaultVal := ""
		if len(split) == 2 {
			defaultVal = strings.TrimSpace(split[1])
		}
		t.Inputs = append(t.Inputs, []string{key, defaultVal})
	}
	t.Text = strings.Join(lines[:len(lines)-1], "\n")
	return t
}

func copyFile(from, to string) error {
	contents, err := os.ReadFile(from)
	if err != nil {
		return fmt.Errorf("Could not read %s: %s", from, err.Error())
	}
	if err = os.WriteFile(to, contents, 0644); err != nil {
		return fmt.Errorf("Could not write to file %s: %s", to, err.Error())
	}
	return nil
}
