import { Record } from '@airtable/blocks/models';
import React from 'react';
import { Box, Heading, Text } from "@airtable/blocks/ui";

type Props =
{
    releases: Record[];
}

type State = {
    template: string;
}

export class Template extends React.Component<Props, State>
{
    constructor(props)
    {
        super(props);
        this.state = {
            template: ""
        };
    }

    public async componentDidMount()
    {
        await this.template();
    }

    public render(): React.ReactNode
    {
        const { template } = this.state;
        if (!template)
        {
            return null;
        }
        return <>
            <Heading>Template</Heading>
            <textarea style={{ width: "100%", height: "50px", marginBottom: "20px" }} defaultValue={template} />
        </>;
    }

    private async template(): Promise<void>
    {
        let template = 
`[vc_row row_height_percent="0" override_padding="yes" h_padding="2" top_padding="3" bottom_padding="3" overlay_alpha="50" gutter_size="3" column_width_percent="100" shift_y="0" z_index="0"]
    [vc_column column_width_percent="100" align_horizontal="align_center" gutter_size="3" overlay_alpha="50" shift_x="0" shift_y="0" shift_y_down="0" z_index="0" medium_width="0" mobile_width="0" width="1/1"]
        [vc_custom_heading text_size="fontsize-155944"]qbo insights Release Notes[/vc_custom_heading]
    [/vc_column]
[/vc_row]



`;
        for (const release of this.props.releases)
        {
            const type = release.getCellValueAsString("Type");
            if (!["major", "minor"].includes(type))
            {
                continue;
            }
            const version = release.name;
            const date = release.getCellValueAsString("End");
            const notes = release.getCellValueAsString("Notes");
            const tasks = await this.tasks(release);

            template += `
[vc_row row_height_percent="0" override_padding="yes" h_padding="2" top_padding="2" bottom_padding="4" overlay_alpha="50" gutter_size="3" column_width_percent="100" shift_y="0" z_index="0"]
    [vc_column column_width_percent="100" gutter_size="2" overlay_alpha="50" shift_x="0" shift_y="0" shift_y_down="0" z_index="0" medium_width="0" mobile_width="0" sticky="yes" width="1/2"]
        [vc_custom_heading heading_semantic="h3" text_size="h1" sub_reduced="yes" subheading="${date} • ${type}"]Version ${version}[/vc_custom_heading]
        [vc_column_text]${notes}[/vc_column_text]
    [/vc_column]
    [vc_column column_width_percent="100" gutter_size="2" overlay_alpha="50" shift_x="0" shift_y="0" shift_y_down="0" z_index="0" medium_width="0" mobile_width="0" width="1/2"]
        ${tasks}
    [/vc_column]
[/vc_row]
[vc_row][vc_column width="1/1"][vc_separator][/vc_column][/vc_row]


`;
        }
        this.setState({ template });
    }

    private async tasks(release: Record): Promise<string>
    {
        let template = "";
        const tasks = (await release.selectLinkedRecordsFromCellAsync("Tasks")).records.sort((a, b) => a.name > b.name ? 1 : -1);
        
        const taskTemplate = (task: Record) =>
        {
            const name = Template.normalize(task.getCellValueAsString("Name"));
            const description = Template.normalize(task.getCellValueAsString("Description"));
            const imageID = task.getCellValueAsString("WP Image ID");
            const image = task.getCellValueAsString("Image");
            if (description)
            {
                template += `
        [vc_custom_heading heading_semantic="h4" text_size="h5" sub_reduced="yes" subheading="${description}"]• ${name}[/vc_custom_heading]`;
            }
            else
            {
                template += `
        [vc_custom_heading heading_semantic="h4" text_size="h5" sub_reduced="yes"]• ${name}[/vc_custom_heading]`;
            }
            if (imageID)
            {
                template += `
        [vc_single_image media="${imageID}" media_lightbox="yes" media_width_percent="100" shape="img-round" shadow="yes" shadow_weight="xs" el_class="release-note-screenshot"]`;
            }
            else if (image)
            {
                template += `
        [vc_single_image media="000000" media_lightbox="yes" media_width_percent="100" shape="img-round" shadow="yes" shadow_weight="xs" el_class="release-note-screenshot"]`;
            }
        };
        template += `[vc_custom_heading text_size="h4"]User facing changes[/vc_custom_heading]`;
        tasks.filter(task => task.getCellValueAsString("Type") === "User facing").forEach(taskTemplate);
        template += `[vc_custom_heading text_size="h4"]Architectural changes[/vc_custom_heading]`;
        tasks.filter(task => task.getCellValueAsString("Type") === "Architectural").forEach(taskTemplate);
        return template;
    }

    private static normalize(input: string): string
    {
        return input.replaceAll("[", "`{`").replaceAll("]", "`}`").replaceAll("\"", "``");
    }
}