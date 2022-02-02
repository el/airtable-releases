import { base } from '@airtable/blocks';
import { Record } from '@airtable/blocks/models';
import { Box, Heading, Text } from "@airtable/blocks/ui";
import React from 'react';


type Props =
{
    record: Record;
    types: string[];
}

type State =
{
    tasks: Record[];
}

export class Release extends React.Component<Props, State>
{
    constructor(props: Props)
    {
        super(props);
        this.state = { tasks: [] };
    }

    public async componentDidMount(): Promise<void>
    {
        const query = await this.props.record.selectLinkedRecordsFromCellAsync("Tasks");
        const tasks = [...query.records].sort((a, b) => a.name > b.name ? 1 : -1);
        this.setState({ tasks });
    }

    public render(): React.ReactNode
    {
        const { record, types } = this.props;
        const { tasks } = this.state;
        const release = types.includes(record.getCellValueAsString("Type"));
        if (!release || !tasks.length)
        {
            return null;
        }
        const taskTemplate = task => <Task key={task.id} record={task} types={[]}/>;
        const userTasks = tasks.filter(task => task.getCellValueAsString("Type") === "User facing");
        const architecturalTasks = tasks.filter(task => task.getCellValueAsString("Type") === "Architectural");
        return (
            <div id={record.id}>
                <Heading as='h2' size="large">Version {record.name.split(" - ")[0]}</Heading>
                <Box border="default" backgroundColor="lightGray1" padding={3} style={{ marginBottom: "3rem" }}>
                    {/* {tasks.map(task => <Task key={task.id} record={task}/>)} */}
                    <Heading as='h3' size="default">User facing changes</Heading>
                    {userTasks.map(taskTemplate)}
                    {!!architecturalTasks.length && <Heading as='h3' size="default">Architectural changes</Heading>}
                    {architecturalTasks.map(taskTemplate)}
                </Box>
            </div>
        );
    }
}

class Task extends React.Component<Props, State>
{
    public render(): React.ReactNode
    {
        const { record } = this.props;
        const name = record.name;
        const desc = record.getCellValueAsString("Description");
        const imag: null | any[] = record.getCellValue("Image") as any;
        return (
            <div>
                <Heading as='h4' size="xsmall">{name}</Heading>
                {!!desc && <Text variant="paragraph" style={{ whiteSpace: "break-spaces" }}>{desc}</Text>}
                {!!imag?.length && <p>{imag.map(img =>
                    <img key={img.id} loading='lazy' src={img.url} style={{aspectRatio: `${img.width}/${img.height}`, border: "1px solid #aaa", width: "100%"}} />
                )}</p>}
            </div>
        )
    }
}