import React from 'react';
import './App.css';

class App extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      fight: "The Ultima Weapon",
      report: "",
      errorMessage: "",
      info: {},
      requestError: false,
      loading: false
    };
  }

  handleReportChange = (e) => {
    this.setState({report: e.target.value});
  }

  handleFightChange = (e) => {
    this.setState({fight: e.target.value});
  }

  handleSubmit = (e) => {
    const url = new URL(this.state.report)
    const report = url.pathname.trimEnd("/").split("/")[2]
    this.setState({requestError: false, loading: true, errorMessage: "", info: {}})
    fetch(`https://www.fflogs.com/v1/report/fights/${report}?api_key=7ffe75b93491065c218baa9ece0d641d`)
      .then(res => res.json())
      .then(
        (res) => {
          this.setInfo(res, report)
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (_err) => {
          this.setState({
            loading: false,
            requestError: true
          });
        }
      )
    e.preventDefault();
  }

  setInfo(info, report) {
    if (info.error) {
      this.setState({ errorMessage: info.error })
      return
    }

    if (this.state.fight == "all") {
      return info.fights
    }

    const fights = info.fights.filter(fight => fight.name == this.state.fight)
    const pullLengths = this.getPullLengths(fights)


    this.setState({
      loading: false,
      info: {
        report: `https://www.fflogs.com/reports/${report}`,
        totalPulls: pullLengths.length,
        totalTime: this.formatTime(this.getTotalTime(pullLengths)),
        longestPull: this.formatTime(Math.max(...pullLengths)),
        medianPull: this.formatTime(this.getMedianPull(pullLengths)),
      }
    });
  }

  getTotalTime(fights) {
    return fights.reduce(function(a, b){
      return a + b;
    }, 0);
  }

  getMedianPull(fights) {
    const sorted = fights.sort(function(a, b){return a-b})
    console.log(sorted)

    if (sorted.length % 2) { // odd
      const middle = Math.floor(sorted.length/2)

      return sorted[middle]
    }
    // even
    const middle_right = sorted.length/2
    const middle_left = middle_right - 1

    return (sorted[middle_left] + sorted[middle_right])/2
  }

  getPullLengths(fights) {
    return fights.map(fight => {
      return (fight.end_time - fight.start_time)/1000
    })
  }

  formatTime(total_sec) {
    var min = total_sec / 60
    const hours = Math.floor(min / 60)
    const sec = Math.round(total_sec % 60)
    min = Math.floor(min % 60)

    return hours > 0 ? `${hours}:${min}:${sec}` : `${min}:${sec}`
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>FFLogs Analyzer</h1>
          <p>
            Get stats on your report!
          </p>
          { this.state.requestError &&
            <p className="error" >Something went wrong!</p>
          }
          { this.state.errorMessage &&
            <p className="error">{this.state.errorMessage}</p>
          }
          <form onSubmit={this.handleSubmit}>
            <p>
              <label>
                Report:
                <input type="text" value={this.state.report} onChange={this.handleReportChange} />
              </label>
            </p>
            <p>
              <label>
                Fight:
                <select value={this.state.fight} onChange={this.handleFightChange}>
                  {/* <option value="all">All</option> */}
                  <option value="The Ultima Weapon">Ultima Weapon (Ultimate)</option>
                </select>
              </label>
            </p>
            <input type="submit" value="Submit" />
          </form>
          {this.state.info.totalPulls && <div>
            <h3>
              Stats
            </h3>
            <p><a className="error" href={this.state.report} target="_blank">view report</a></p>
            <p>
              total pulls: {this.state.info.totalPulls}
            </p>
            <p>
              total time: {this.state.info.totalTime}
            </p>
            <p>
              longest pull: {this.state.info.longestPull}
            </p>
            <p>
              median pull: {this.state.info.medianPull}
            </p>
          </div>}
        </header>
      </div>
    );
  }
}

export default App;
