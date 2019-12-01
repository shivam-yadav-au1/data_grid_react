import React from 'react'
import ReactDOM from 'react-dom'
import './datatable.css'

class DataTable extends React.Component{

    _preSearchData = null
    constructor(props){
        super(props)

        this.state={
            headers:props.headers,
            data:props.data,
            sortby:null,
            descending:null,
            search:false
        }
        this.keyField = props.keyField || "id";
        this.noData = props.noData || "No records found!";
        this.width = props.width || "100%";
    }

    onDragOver =(e)=>{
        e.preventDefault();
    }

    onDragStart =(e,source)=>{
        console.log(e,source);
        e.dataTransfer.setData('text/plain',source);
    }

    onDrop =(e,target)=>{
        console.log(e,target);
        e.preventDefault();
        let source = e.dataTransfer.getData('text/plain');
        let headers = [...this.state.headers];
        let srcHeader = headers[source];
        let targetHeader = headers[target];

        let temp = srcHeader.index;
        srcHeader.index = targetHeader.index;
        targetHeader.index = temp;

        this.setState({
            headers
        })
    }

    renderTableHeader = () =>{
        let {headers} = this.state;
        headers.sort((a,b)=>{
            if(a.index > b.index) return 1;
            return -1;
        })

        let headerView = headers.map((header,index)=>{
            let title = header.title;
            let cleanTitle = header.accessor;
            let width = header.width;

            if(this.state.sortby === index){
                title += this.state.descending ? '\u2193':'\u2191';
            }

            return (
                <th key={cleanTitle}
                    ref = {(th)=>this[cleanTitle]= th}
                    style = {{width:width}}
                    data-col={cleanTitle}
                    onDragStart={(e)=>this.onDragStart(e,index)}
                    onDragOver={this.onDragOver}
                    onDrop={(e)=>{this.onDrop(e,index)}}
                    >
                    <span draggable className="header-cell" data-col={cleanTitle}>{title}</span>
                </th>
            )
        })
        return headerView;
    }
    renderContent = ()=>{
        let {headers,data} = this.state;
        let contentView = data.map((row,rowIdx)=>{
            let id = row[this.keyField];
            let tds = headers.map((header,index)=>{
                let content = row[header.accessor]
                let cell = header.cell;
                if(cell){
                    if(typeof(cell) === 'object'){
                        if(cell.type === 'image' && content){
                            content = <img style={cell.style} src={content}/>
                        }
                    }
                    else if(typeof(cell) === 'function'){
                        content = cell(content);
                    }
                }

                return (
                    <td key={index} data-id={id} data-row={rowIdx}>{content}</td>
                )

            });
            return (
                <tr>
                    {tds}
                </tr>
            )
        });
        
       return contentView;

    }
    renderNoData = () =>{
        return(
            <tr>
                <td colSpan={this.props.headers.length}>
                    {this.noData}
                </td>
            </tr>
        )
    }

    onSort =(e)=>{
        
        let data = this.state.data.slice();//Give new array
        let colIndex = ReactDOM.findDOMNode(e.target).parentNode.cellIndex;
        console.log(ReactDOM.findDOMNode(e.target).parentNode.cellIndex);
        let colTitle = e.target.dataset.col;
        let descending = !this.state.descending;
        
        data.sort((a,b)=>{
            let sortVal = 0;
            if(a[colTitle] < b[colTitle]){
                sortVal = -1
            }else if(a[colTitle] > b[colTitle]){
                sortVal = 1;
            }

            if(descending){
                sortVal = sortVal * -1;
            }
            return sortVal;
        })

        this.setState({
            data,
            sortby:colIndex,
            descending
        })
    }
    onSearch = (e)=>{
        let needle = e.target.value.trim().toLowerCase();
        
        if(!needle){
            this.setState({
                data:this._preSearchData
            })
        }
        let idx = e.target.dataset.idx;
        let targetCol = this.state.headers[idx].accessor;

        let searchData =  this._preSearchData.filter((row)=>{
            return row[targetCol].toString().toLowerCase().indexOf(needle) >-1;
        })

        this.setState({
            data:searchData
        })
    }

    renderSearch = ()=>{
        let {search,headers} = this.state;
        if(!search){
            return null;
        }
        let searchInputs = headers.map((header,idx)=>{
            let hdr = this[header.accessor];
            
                return(
                    <td key={idx}>
                        <input type="text" style={{width:hdr.clientWidth-17}} data-idx={idx}/>
                    </td>
                )
        })
        return (
            <tr onChange={this.onSearch}>
                {searchInputs}
            </tr>
        )
    }

    renderTable = ()=>{
        let title = this.props.title || "DataTable";
        let headerView = this.renderTableHeader();
        let contentView = this.state.data.length > 0 ? this.renderContent() 
                          : this.renderNoData();

        return (
            <table className="data-inner-table">
                <caption className="data-table-caption">
                    {title}
                </caption>
                <thead onClick={this.onSort}>
                    <tr>
                        {headerView}
                    </tr> 
                </thead>
                <tbody>
                    {this.renderSearch()}
                    {contentView}
                </tbody>
            </table>
        )
    }

    onToggleSearch =(e)=>{
        if(this.state.search){
            this.setState({
                data:this._preSearchData,
                search:false
            });
            this._preSearchData = null;
        }else{
            this._preSearchData = this.state.data;
            this.setState({
                search:true
            })
        }

    }
    renderToolbar =()=>{
        return(
            <div className="toolbar">
                <button onClick={this.onToggleSearch}>
                    Search
                </button>
            </div>
        )
    }

    render(){
        return (
           <div className={this.props.className}>
               {this.renderToolbar()}
               {this.renderTable()}
           </div>
        )
    }
}

export default DataTable;