import axios from 'axios';

async function symbolPrice(symbol) {
    try {
        // var data = await axios.get('https://paker-servers-cors.herokuapp.com/https://query1.finance.yahoo.com/v7/finance/quote?lang=en-US&region=US&corsDomain=finance.yahoo.com&symbols='+symbol).then(x => x.data);
        var data = await axios.get('https://query1.finance.yahoo.com/v7/finance/quote?lang=en-US&region=US&corsDomain=finance.yahoo.com&symbols='+symbol).then(x => x.data);
        return data.quoteResponse.result;
    } catch (error) {
        return [];
    }
}

async function search(query) {
    try {
        // var data = await axios.get('https://paker-servers-cors.herokuapp.com/https://query2.finance.yahoo.com/v1/finance/search?lang=en-US&region=US&quotesCount=6&newsCount=4&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&newsQueryId=news_cie_vespa&enableCb=true&enableNavLinks=true&enableEnhancedTrivialQuery=true&q=' + query).then(x => x.data);
        var data = await axios.get('https://query2.finance.yahoo.com/v1/finance/search?lang=en-US&region=US&quotesCount=6&newsCount=4&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&newsQueryId=news_cie_vespa&enableCb=true&enableNavLinks=true&enableEnhancedTrivialQuery=true&q=' + query).then(x => x.data);
        var t = data.quotes;
        return t.filter(i => i.isYahooFinance);
    } catch (error) {
        return []
    }
}

async function getCompanyProfile(symbol) {
    // var data = await axios.get('https://paker-servers-cors.herokuapp.com/https://query2.finance.yahoo.com/v10/finance/quoteSummary/'+symbol+'?modules=assetProfile').then(x => x.data).catch(e => {
        var data = await axios.get('https://query2.finance.yahoo.com/v10/finance/quoteSummary/'+symbol+'?modules=assetProfile').then(x => x.data).catch(e => {
    });
    data = data != undefined ? data.quoteSummary.result[0].assetProfile : undefined;
    if (data != undefined) {
        data.longBusinessSummary = await translate(data.longBusinessSummary);
    }
    return data;
}

async function translate(text) {
    var translated = await axios.get('https://parker-servers-translate.herokuapp.com/translate/pt/' + text).then(x => x.data.text);
    return translated;
}

export default { search, symbolPrice, getCompanyProfile }