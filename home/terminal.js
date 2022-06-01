import React, { useState, useEffect, useRef } from 'react'
import Config from '../config/config'
import Stocks from '../Stocks'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import Autocomplete from '@mui/material/Autocomplete'
import { DataArray } from '@mui/icons-material'

const render = () => {
  let timer
  const [favorites, setFavorites] = useState([])
  const [count, setCount] = useState(0)
  const [modalInfo, setModalInfo] = useState([]);
  useRef.favorites = favorites
  useRef.count = count

  useEffect(() => {
    Config.getConfig(async config => {
      var favs = []
      var toRemove = []
      var modalInfos = [];
      for (var i = 0; i < config.favorites.length; i++) {
        var x = config.favorites[i]
        var response = await Stocks.symbolPrice(x.symbol);
        var info = await Stocks.getCompanyProfile(x.symbol);
        if (info != undefined) {
          modalInfos.push({...info, symbol: x.symbol});
        }
        favs.push(response[0])
      }
      setFavorites(favs)
      setModalInfo(modalInfos);
      updatePrices()
    })
    return () => clearInterval(timer)
  }, [])

  const updatePrices = () => {
    timer =
      !timer &&
      setInterval(async () => {
        setCount(prevCount => prevCount + 1)
        var favs = [...useRef.favorites]
        for (var i = 0; i < favs.length; i++) {
          var data = await Stocks.symbolPrice(favs[i].symbol)
          favs[i] = data[0]
        }
        setFavorites(favs)
      }, 1000)
  }

  const favoritar = symbol => {
    Config.getConfig(async config => {
      if (config.favorites.indexOf(symbol) == -1) {
        var info = await Stocks.getCompanyProfile(symbol);
          if (info != undefined) {
            setModalInfo(prevModalInfo => [...prevModalInfo, {...info, symbol}]);
          }
        config.favorites.push({ symbol: symbol })
        Config.setConfig(config)
        var data = await Stocks.symbolPrice(symbol)
        setFavorites([...favorites, data[0]])
      }
    })
  }

  const desfavoritar = async symbol => {
    Config.getConfig(config => {
      var x = config.favorites;
      var index = config.favorites.map(x => x.symbol).findIndex(x => x == symbol)
      x.splice(index, 1)
      Config.appendConfig({
        favorites: x
      })
      setFavorites(favorites.filter(x => x.symbol != symbol))
    })
  }

  return (
    <div
      style={{
        width: 'calc(100vw - 150px)',
        backgroundColor: 'hsl(var(--b2))',
        minHeight: 'calc(100vh - 35px)'
      }}
    >
      <Header favorites={favorites} modalInfo={modalInfo} desfavoritar={desfavoritar}/>
      <Search
        desfavoritar={desfavoritar}
        favoritar={favoritar}
        favorites={favorites}
      />
    </div>
  )
}

const Header = ({ favorites, modalInfo, desfavoritar }) => {
  return (
    <div
      style={{
        height: '200px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-evenly'
      }}
    >
      <div className='stats shadow'>
        {favorites.map(ativo => {
          return (
            <div
              key={'favs-' + ativo.symbol}
              className='stat place-items-center'
            >
              <div style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                <div className='stat-title'>{ativo.symbol}</div>
                <label
                className="cursor"
                onClick={(e) => {
                  desfavoritar(ativo.symbol)
                }}
                    >
                      ✕
                    </label>
              </div>
              <div
                className='stat-value'
                style={{
                  color:
                    parseFloat(ativo.regularMarketChangePercent).toFixed(2) > 0
                      ? 'hsl(var(--su))'
                      : 'hsl(var(--er))'
                }}
              >
                {parseFloat(ativo.regularMarketPrice).toFixed(2)}{' '}
                {ativo.currency}
              </div>
              <div
                className='stat-desc'
                style={{
                  color:
                    parseFloat(ativo.regularMarketChangePercent).toFixed(2) > 0
                      ? 'hsl(var(--su))'
                      : 'hsl(var(--er))'
                }}
              >
                {parseFloat(ativo.regularMarketChangePercent).toFixed(2) > 0
                  ? '↗︎'
                  : '↘︎'}{' '}
                {parseFloat(ativo.regularMarketChangePercent).toFixed(2)}%
              </div>
              <div>
                  {modalInfo.findIndex(x => x.symbol == ativo.symbol) != -1 ?
                  <label htmlFor={'ativo-status-' + ativo.symbol} className='modal-button cursor'>
                    Informações
                  </label> : false}
                <input type='checkbox' id={'ativo-status-' + ativo.symbol} className='modal-toggle' />
                <div className='modal'>
                  <div className='modal-box relative'>
                    <label
                      htmlFor={'ativo-status-' + ativo.symbol}
                      className='btn btn-sm btn-circle absolute right-2 top-2'
                    >
                      ✕
                    </label>
                    <h3 className='text-lg font-bold'>
                      {ativo.shortName}
                    </h3>

                    <div style={{marginTop: 15}} tabIndex="0" class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
                      <div class="collapse-title text-xl font-medium">
                        Descrição
                      </div>
                      <div class="collapse-content"> 
                      {modalInfo.filter(x => x.symbol ==ativo.symbol).length > 0 ? modalInfo.filter(x => x.symbol == ativo.symbol)[0].longBusinessSummary : false}
                      </div>
                    </div>

                    <div style={{marginTop: 15}} tabIndex="0" class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
                      <div class="collapse-title text-xl font-medium">
                        Sócios
                      </div>
                      <div class="collapse-content"> 
                      {modalInfo.filter(x => x.symbol ==ativo.symbol).length > 0 ? modalInfo.filter(x => x.symbol == ativo.symbol)[0].companyOfficers.map(x => {
                        return <p key={ativo.symbol + '-socios-' + x.name} style={{marginTop: 5}}>
                          <b>{x.name}</b> | {x.title}
                        </p>
                      }) : false}
                      </div>
                    </div>

                    <div style={{marginTop: 15}} tabIndex="0" class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
                      <div class="collapse-title text-xl font-medium">
                        Endereço
                      </div>
                      <div class="collapse-content"> 
                        <p>Cidade: {modalInfo.filter(x => x.symbol ==ativo.symbol).length > 0 ? modalInfo.filter(x => x.symbol == ativo.symbol)[0].city : false}</p>
                        <p>Endereço: {modalInfo.filter(x => x.symbol ==ativo.symbol).length > 0 ? modalInfo.filter(x => x.symbol == ativo.symbol)[0].address1 : false}</p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const Search = ({ favoritar, favorites, desfavoritar }) => {
  const [search, setSearch] = useState('')
  const [autoSearch, setAutoSearch] = useState([])

  useEffect(() => {}, [])

  const updateAutocomplete = async term => {
    setSearch(term)
    if (term.trim().length == 0) {
      setAutoSearch([])
    } else {
      var data = await Stocks.search(term)
      data = data.filter(x => x.quoteType != 'OPTION')
      setAutoSearch(data)
    }
  }

  return (
    <div>
      <div
        style={{
          width: '100%',
          height: 50,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div className='divider' style={{ width: '100%' }}>
          <input
            value={search}
            onChange={e => updateAutocomplete(e.target.value)}
            type='text'
            placeholder='Pesquise aqui...'
            className='input input-bordered input-primary w-full max-w-xs'
          />
        </div>
      </div>
      <div
        style={{
          paddingTop: 15,
          width: '100%',
          height: 'calc(100vh - 335px)',
          overflow: 'auto'
        }}
      >
        <center>
          {autoSearch.map(x => {
            return (
              <Search_Card
                desfavoritar={desfavoritar}
                favorite={
                  favorites.filter(a => a.symbol == x.symbol).length > 0
                }
                favoritar={favoritar}
                key={'search_' + x.symbol}
                data={x}
              />
            )
          })}
        </center>
      </div>
    </div>
  )
}

const Search_Card = ({ data, favoritar, favorite, desfavoritar }) => {
  return (
    <div style={{ marginTop: 10 }} className='card w-96 bg-base-100 shadow-xl'>
      <div className='card-body' style={{ textAlign: 'start' }}>
        <h2 className='card-title'>
          {data.longname || data.shortname}
          <div className='badge badge-secondary'>{data.symbol}</div>
        </h2>
        {data.sector ? <p>Setor: {data.sector}</p> : false}
        {data.industry ? <p>Indústria: {data.industry}</p> : false}
        <div className='card-actions justify-end'>
          {favorite ? (
            <div className='badge badge-secondary'>
              <button
                onClick={() => {
                  desfavoritar(data.symbol)
                }}
              >
                Desfavoritar
              </button>
            </div>
          ) : (
            <div className='badge badge-primary'>
              <button
                onClick={() => {
                  favoritar(data.symbol)
                }}
              >
                Favoritar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default { render }
