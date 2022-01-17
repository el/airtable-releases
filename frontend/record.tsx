import { base } from '@airtable/blocks';
import { Record } from '@airtable/blocks/models';
import { Box, Heading, Text } from "@airtable/blocks/ui";
import React from 'react';


type Props =
{
    record: Record;
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
        const { record } = this.props;
        const { tasks } = this.state;
        const releaseTypes = ["major", "minor", "release-candidate", "in-development"];
        const release = releaseTypes.includes(record.getCellValueAsString("Type"));
        if (!release || !tasks.length)
        {
            return null;
        }
        const taskTemplate = task => <Task key={task.id} record={task}/>;
        const userTasks = tasks.filter(task => task.getCellValueAsString("Type") === "User facing");
        const architecturalTasks = tasks.filter(task => task.getCellValueAsString("Type") === "Architectural");
        return (
            <div id={record.id}>
                <Heading size="large">{record.name}</Heading>
                <Box border="default" backgroundColor="lightGray1" padding={3} style={{ marginBottom: "3rem" }}>
                    {/* {tasks.map(task => <Task key={task.id} record={task}/>)} */}
                    <Heading size="default">User facing changes</Heading>
                    {userTasks.map(taskTemplate)}
                    {!!architecturalTasks.length && <Heading size="default">Architectural changes</Heading>}
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
                <Heading size="xsmall">{name}</Heading>
                <Text variant="paragraph" style={{ whiteSpace: "break-spaces" }}>{desc}</Text>
                <p>
                    {imag && imag.map(img =>
                        <img key={img.id} src={img.url} style={{border: "1px solid #aaa", width: "100%"}} />
                    )}
                </p>
            </div>
        )
    }
}