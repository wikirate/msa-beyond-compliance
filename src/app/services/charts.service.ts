// @ts-ignore
import pieChart from '../../assets/charts/pie.json';
// @ts-ignore
import simpleBarChart from '../../assets/charts/simple-bar.json';
// @ts-ignore
import donutChart from '../../assets/charts/donut.json';
// @ts-ignore
import semiDonutChart from '../../assets/charts/semi-donut.json';
// @ts-ignore
import singleBarChart from '../../assets/charts/single-bar.json';
// @ts-ignore
import barChart from '../../assets/charts/bars.json';
// @ts-ignore
import groupedBarsChart from '../../assets/charts/subgroup-bars.json';
// @ts-ignore
import shankeyChart from '../../assets/charts/shankey-chart.json';
// @ts-ignore
import radarChart from '../../assets/charts/radar.json';
import { Injectable } from "@angular/core";
import embed from "vega-embed";
import { Filter } from "../models/filter.model";
import { DataProvider } from "./data.provider";

@Injectable()
export class ChartsService {
  wikirateApiHost = "https://wikirate.org"

  addListenerOnChartClick(result: any): void {
    const view = result.view

    //add Signal Listener for open url in a new tab when user clicks on the bar chart
    view.addSignalListener('click', (name: string, value: any) => {
      if (value) {
        window.open(value, '_blank');
      }
    });

    view.addEventListener('click', () => {
      view.signal('click', null).run();
    });
  }

  drawRadarChart(title: string, element: string, values: any[], url: string, options: {}) {
    var chart = JSON.parse(JSON.stringify(radarChart))
    // bar['signals']['0']['value'] = title
    chart['data'][0]['values'] = values
    // bar['data'][1]['transform'][2]['expr'] = "'" + `${url}` + "'"
    return embed(element, chart, options);
  }

  drawSingleBar(title: string, element: string, values: any[], url: string, options: {}) {
    var bar = JSON.parse(JSON.stringify(singleBarChart))
    bar['signals']['0']['value'] = title
    bar['data'][0]['values'] = values
    bar['data'][1]['transform'][2]['expr'] = "'" + `${url}` + "'"
    return embed(element, bar, options).then(result => this.addListenerOnChartClick(result));
  }

  drawShankeyChart(element: string, values: any[], options: {}) {
    var chart = JSON.parse(JSON.stringify(shankeyChart))
    chart['data'][0]['values'] = values
    return embed(element, chart, options);
  }

  drawPieChart(title: string,
    element: string,
    values: {}[],
    width: number,
    height: number,
    colors: string[],
    domain: string[],
    options: {}) {
    var pie = JSON.parse(JSON.stringify(pieChart))
    pie["description"] = title
    pie["data"][0]["values"] = values
    pie["width"] = width
    pie["height"] = height
    pie["scales"][0]["range"] = colors
    pie["scales"][0]["domain"] = domain

    return embed(element, pie, options).then(result => this.addListenerOnChartClick(result));
  }

  drawDonutChart(title: string,
    element: string,
    values: {}[],
    width: number,
    height: number,
    colors: string[],
    domain: string[],
    options: {}) {
    var donut = JSON.parse(JSON.stringify(donutChart))
    donut["title"]["text"] = title
    donut["data"][0]["values"] = values
    donut["width"] = width
    donut["height"] = height
    donut["scales"][0]["range"] = colors
    donut["scales"][0]["domain"] = domain

    return embed(element, donut, options).then(result => this.addListenerOnChartClick(result))
  }

  drawSemiDonutChart(title: string,
    element: string,
    values: {}[],
    width: number,
    colors: string[],
    domain: string[],
    options: {}) {
    var donut = JSON.parse(JSON.stringify(semiDonutChart))
    donut["title"]["text"] = title
    donut["data"][0]["values"] = values
    donut["width"] = width
    donut["scales"][0]["range"] = colors
    donut["scales"][0]["domain"] = domain

    return embed(element, donut, options).then(result => this.addListenerOnChartClick(result));
  }

  drawSimpleBarChart(title: string,
    element: string,
    values: {}[],
    options: {}) {
    var simple_bar = JSON.parse(JSON.stringify(simpleBarChart))
    simple_bar["title"]["text"] = title
    simple_bar["data"][0]["values"] = values
    return embed(element, simple_bar, options).then(result => this.addListenerOnChartClick(result))
  }

  drawSubgroupsBarChart(
    title: string,
    element: string,
    width: number,
    meets_requirements_metric_id: number,
    metric: number,
    subgroups: any,
    groups: any,
    year: number | string,
    company_groups: string[],
    options: {}) {
    let bars = JSON.parse(JSON.stringify(groupedBarsChart))
    let data: any[] = []

    let filters: Filter[] = [new Filter('company_group', company_groups), new Filter('year', year)]
    data.push({
      "name": 'meets_min_requirements',
      "url": `${this.wikirateApiHost}/~${meets_requirements_metric_id}+Answer.json?${DataProvider.getParams(filters).toString()}`,
      "transform": [{ "type": "formula", "as": "key", "expr": "datum.company + ',' + datum.year" }]
    })

    if (year == 'latest') {
      filters.pop()
    }

    data.push({
      "name": "answers",
      "url": `${this.wikirateApiHost}/~${metric}+Answer.json?${DataProvider.getParams(filters).toString()}`,
      "transform": [
        {
          "type": "formula",
          "as": "key",
          "expr": "datum.company + ',' + datum.year"
        },
        {
          "type": "lookup",
          "from": "meets_min_requirements",
          "key": "key",
          "fields": ["key"],
          "values": ["value"],
          "as": ["meets_min_requirements"]
        },
        {
          "type": "filter",
          "expr": "datum.meets_min_requirements == 'Yes' || datum.meets_min_requirements == 'No' || datum.meets_min_requirements == 'Unknown'"
        },
        {
          "type": "formula",
          "expr": "split(datum.value, ', ')",
          "as": "value_array"
        }
      ]
    })
    data.push(subgroups)
    data.push(groups)
    data.push(bars['data'][4])

    bars['description'] = title;
    bars['data'] = data
    bars['width'] = width
    return embed(element, bars, options)
  }

  drawBarChart(
    title: string,
    element: string,
    width: number,
    height: number,
    meets_requirements_metric_id: number,
    metrics: [],
    year: number | string,
    company_groups: string[],
    options: {}) {
    let bars = JSON.parse(JSON.stringify(barChart))
    let data: any[] = []

    let filters: Filter[] = [new Filter('company_group', company_groups), new Filter('year', year)]
    data.push({
      "name": 'meets_min_requirements',
      "url": `${this.wikirateApiHost}/~${meets_requirements_metric_id}+Answer.json?${DataProvider.getParams(filters).toString()}`,
      "transform": [{ "type": "formula", "as": "key", "expr": "datum.company + ',' + datum.year" }]
    })

    if (year == 'latest') {
      filters.pop()
    }

    data.push({
      "name": "answers",
      // @ts-ignore
      "url": `${this.wikirateApiHost}/~${metrics[0]['id']}+Answer.json?${DataProvider.getParams(filters).toString()}`,
    })
    let short_labels: any[] = []
    for (let metric of metrics) {
      short_labels.push(metric['short_label'])
      let condition = '';
      // @ts-ignore
      for (let value of metric['filter_value']) {
        condition += 'indexof(datum.value, \'' + value + '\') >= 0 || '
      }
      condition = condition.substring(0, condition.length - 3)
      data.push({
        name: metric['short_label'],
        "source": ["answers"],
        "transform": [
          {
            "type": "formula",
            "as": "key",
            "expr": "datum.company + ',' + datum.year"
          },
          {
            "type": "lookup",
            "from": "meets_min_requirements",
            "key": "key",
            "fields": ["key"],
            "values": ["value"],
            "as": ["meets_min_requirements"]
          },
          {
            "type": "filter",
            "expr": "datum.meets_min_requirements == 'Yes' || datum.meets_min_requirements == 'No' || datum.meets_min_requirements == 'Unknown'"
          },
          {
            "type": "formula",
            "as": "accepted_value",
            "expr": "if(" + condition + ", true, false)"
          },
          { "type": "aggregate", "groupby": ["accepted_value"] },
          {
            "type": "impute",
            "key": "accepted_value",
            "keyvals": [true],
            "field": "count",
            "value": 0
          },
          { "type": "joinaggregate", "fields": ["count"], "ops": ["sum"] },
          { "type": "filter", "expr": "datum.accepted_value == true" }
        ]
      })
    }
    data.push({ 'name': 'metrics', 'values': metrics })
    data.push({
      "name": "counts",
      "source": short_labels,
      "transform": [
        {
          "type": "window",
          "ops": [
            "row_number"
          ],
          "as": [
            "seq"
          ]
        },
        {
          "type": "lookup",
          "from": "metrics",
          "key": "seq",
          "fields": [
            "seq"
          ],
          "values": [
            "label",
            "metric",
            "color",
            "filter_value"
          ],
          "as": [
            "title",
            "wikirate_page",
            "color",
            "filter_value"
          ]
        },
        {
          "type": "formula",
          "expr": "datum.count/datum.sum_count",
          "as": "percentage"
        },
        {
          "type": "formula",
          "expr": "format(datum.count / datum.sum_count, '.0%')",
          "as": "percent_label"
        },
        {
          "type": "formula",
          "expr": "datum.count + ' out of ' + datum.sum_count + ' statements'",
          "as": "count_label"
        },
        {
          "type": "formula",
          "expr": "{ value: datum.filter_value }",
          "as": "filter"
        }
      ]
    })

    bars['description'] = title;
    bars['data'] = data
    bars['width'] = width
    bars['height'] = height
    return embed(element, bars, options)
  }
}
