import { initializeBlock, Select, TablePicker } from '@airtable/blocks/ui';
import { base } from '@airtable/blocks';
import { Record, Table } from '@airtable/blocks/models';
import React, { Component, ReactNode } from 'react';
import { Release } from "./record";
import { Template } from "./template";
import { padding } from '@airtable/blocks/dist/types/src/ui/system';


type Props = {
    table: Table;
}
type State =
{
    displayAll: boolean;
    options: any[];
    records: Record[];
    record?: Record;
    table?: Table;
}

class App extends Component<{}, State>
{
    constructor(props: Props)
    {
        super(props);
        this.state = { displayAll: false, records: [], options: [] };
    }

    public componentDidMount(): void
    {
        let table: Table | undefined;
        try 
        {
            table = base.getTableByName("Releases");
        }
        catch
        {
            return;
        }
        this.setState({ table })
    }

    public render(): ReactNode
    {
        const { table } = this.state;
        return (
            <div style={{ padding: "1rem" }}>
                {/* <TablePicker table={table} onChange={t => this.handleTablePicker(t)}/> */}
                {table && <Selected key={table.id} table={table}/>}
            </div>
        )
    }

    private async handleTablePicker(table: Table): Promise<void>
    {
        this.setState({ table });
        const hasField = table.getFieldByNameIfExists("Tasks");
        if (!hasField)
        {
            this.setState({ table: undefined });
        }
    }
}

class Selected extends Component<Props, State>
{
    constructor(props: Props)
    {
        super(props);
        this.state = { displayAll: false, records: [], options: [] };
    }

    public async componentDidMount(): Promise<void>
    {
        const queryResult = await this.props.table.selectRecordsAsync();
        const releaseTypes = ["major", "minor", "release-candidate", "in-development"];
        const records = [...queryResult.records].reverse();
        const options: any[] = [...records].reverse().map(rec =>
            ({ label: rec.name, value: rec.id, disabled: !releaseTypes.includes(rec.getCellValueAsString("Type")) }));
        this.setState({ records, options });
    }

    public render(): ReactNode
    {
        const { table } = this.props;
        const { displayAll, options, record, records } = this.state;
        const optionList = [
            { label: "Select a record", value: undefined, disabled: true },
            { label: "Display all", value: "ALL" },
            ...([...options].reverse())
        ];
        const released = ["major", "minor"];
        const unreleased = ["release-candidate", "in-development"];
        return (
            <div style={{ maxWidth: "700px", margin: "1rem auto" }}>
                <Select
                    style={{float: "right"}}
                    options={optionList}
                    value={record ? record.id : displayAll ? "ALL" : undefined}
                    onChange={value => value === "ALL"
                        ? this.setState({ displayAll: true })
                        : this.setState({ displayAll: false, record: records.find(rec => rec.id === value) })}
                    width="320px"
                />
                <h1>{table.name} {displayAll ? "All" : record ? "-" : ""}</h1>
                {(!!record || !!displayAll) && <Template key={`${Math.random()}`} releases={displayAll ? records : [record]} />}
                {!!record && !displayAll && <Release key={record.id} record={record} types={[...released, ...unreleased]} />}
                <h2>Unreleased:</h2>
                    {!!displayAll && records.map(rec => <Release key={rec.id} record={rec} types={unreleased}/>)}
                <h2>Released:</h2>
                <div id='release-notes'>
                    {!!displayAll && records.map(rec => <Release key={rec.id} record={rec} types={released}/>)}
                </div>
            </div>
        );
    }
}



initializeBlock(() => <App />);
