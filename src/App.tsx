import React, { useState, useEffect, useCallback, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area, CartesianGrid } from "recharts";
import { canSpend, recordSpend, getBudgetStatus } from "./lib/budgetGate";
import { hasAccess } from "./lib/userTier";
import Dashboard from "./Dashboard";

const C={
  bg0:"#080e14",bg1:"#0d1520",bg2:"#121d2c",bg3:"#192538",
  border:"#1e2e42",border2:"#28405a",
  txt0:"#f0f5ff",txt1:"#c2d4e8",txt2:"#7a9ab8",txt3:"#3a5570",
  gold:"#d4a843",goldL:"#f0cc5a",
  up:"#22d46e",upD:"#0f2e1c",dn:"#f04545",dnD:"#3a1010",
  blue:"#4a9eff",amber:"#f0a020",vix:"#b060f0",bond:"#20c8d8",
};
const LOGO_B64="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAsCAIAAAC/o+zEAAAPnUlEQVR42pVZe3gUVZY/59569COdTjovAiSkSYI8RIIGXRAfIA8RFgWRFXFFFBUV13UEXHV0dlzBF+q4IzuIODLqOPs5jvPhzKiLggPOiIoM8jA8E/KEJN3pV3V3VXVV3bt/VKfTHRrGqXxfp+rWrXt/957X75yLhYWFAICIiGjfAHBEBMg85vxmX+drP7sVAIADACKBf/wikIaUMxHneSfJbe3/ME87QF6Y9jc5/fPMfi6gfFBPfk6I/Kzd4fm/4JznGybfDOftmAvU3sKBOc6aMj/4rLeDevBBr9KP2Z2z3yL/wUD539+Es5ENak+LmyASBEQbC8+GmFYGtFWLn2uoc10C5xwzsxHMoOWcZ9sDz6PJ6SWmJwfQDZayGCVIESSBUkIAwLJ4Bh8gAnBu/9r/0xqdHuk86kplWc42eW4PmGPyAPkeM6MiIkE0GautcDdUFRVI1OGQFM3qCyuWaTgcEkGSXjbnAJyndCTUxo0Z2+L9Defa0RxjZzy9V5gjVsz7yAEAKEFAZIwFA6Glkyp/On9cS2dQdrnJ0Mrdvfpvtx/bu7eJAxS4nYwxXYkVrf+FK9AV+PkzxF0APNeWOPD0pp9LRznPmACe25IGaRVBRIBQTA3HkoVux6Sx1WNGVHQp5vrtJ1/784meYOTuO2d++umvP9z2YuP4mphmGNEQvWGpc/5iLdCNMKCp9man95KdU3fR4/FkHD4HTmxX3y+DvNIHAFEg0UQKgC2YPu7uOY0X+ysKnFTtC+5rar/uqW2KngKAMfVDl69Y9PCDN5JU9LF7X9qwL3TBH79gf/hNz6MPiMWl/QZoCx1Jv5GlJYo42DvnB3pW1EnfICAgJRhUktPGD3/5kUVV1eWf79y/c1/L4ROd3htvcS9dcXDXX7VjR7Vv9nTv2mWYRl1t5SuPL35v295PV2zwOYTuW+cJAEBoDtDsKbKMJI+O2urRH5MG7D1j+xlrIJQEleTyy+semDfx3W17tm4/dKY7DGACwIjL1ZFF1cnSFuYfU3L3g6MjZyKv/ffBt96de8crVS+8OvTShsTNc5yWpotumhEwz9G09LzZutsPmkqSlLUUBM4JYn8YxEExnRAMxdUVU/yN/rIVm//88VfNXEv6yktGXDXdv2Bx1T8vpAnlyMKZsQ9/b3V2uiZPrr/zDlcqyX3lda9saHvw31abhydOGPVZU49DIOfyonkM3xajJImZt8RWavuPc1sZENKaTglGtdTUKs9Qt/SffzrIkRQVSCWzF/p/vGHEytVlU6+mbo/eHYjt3m50tEb27T2zdUsy0Jfq6pq0eXPgo0+O/seahtHDlk4c8n1Abe6JyyL9B7ACUEmS8/nIgb3kaQ0GzeSlojWxdtjOIbOEWI9lpYY/uL7qtlXWmY6WTS/sf/JhCMfKJk4rHDvVN32Or77GONHUtXPnjW+8ITodB9eu4aq6u6lz0WUjp44b+v63HWhPgj8Ua7YfBcZ4v81kyT2tPcSyUlXF0l55rHvUxUWVwzRBcA8fdeKpBwO7P0bDjOu6FU9CPNm1/QNpTMPYnzx/xar7oke/r77k4rcW3liybkPVgb1f3H/fK7tb/nfNjCvGDNm+v7PILVmMnydWZ8MlZ/tIzPK5GbeWMi0PprTKi/pCoZObHrU8Q9xVY3p/9VLki088RUWSUyosq3ANGaH1Bnt2fnDs6ZW7F8yIaPqF8+Ye//iTI9u2aUebhqxcWT7+ot37T6me4nvmjUf8+9E+u4eQj2CkQy8i8oxtcWYhjcklyqGPvRdOg2Q8eeJ01bW3YTIS6myt+dfH/POXyF5P98HDE37yttb23fdbniUmi0SVIbNmX7Jgwb4Vy8quvGrJW5seNfc4fDLCSZdEGf+hNAgRhUEBbACm7SwwLXduGZa3PNFzioEwdPqS4JcfKO1HnUtW+6YtLXJ6XaVlR3+zKXpkrxYOyuXVTEtOfn5T5ajaLQ0XTnn51caNr/HxEz3FvlBFiWCGN29674Gfvl/iK+Kc53WZeeGSge09K1TaTC0d5hgXHR410Oa94DIWC8ZbDkmy88ibT4Or1OjtOvhfy0788tngnh1a6+Hu3X8Qi8uHTp+/a+3jTm/FZ3feFmFk3I+fMPd9/cWKlQ/dt8FdUW4xpITYw/5A6izY4dxeVja1s918BjtSwg1di0XK6y6JthwSXd5ET2txwxwrHOh4f4MZCwydPLN0ylzLYkrbsZrF9x772dPth5pmv/v5h1OHt7z7rkNLtn+xc9bPN+1bPGPujPFul8NiLG0PjPPz8qasnIkPyhJsWov9jBg550iplYozFIgoJ0+3CKJkGqmikRf37f1Ij/R6x88YvuBHctU4LB7mnXQtJKPN778eOvS1EgzV33xX8682F5WVJKNRHDY8ZtGenrAkCwObgoM5//kYPh/IC3j/pyw7zBGkhhoHKlq6QUSnxcFZOQoITXYdNVEqumi6qSWNUMCMhlPhICnwDbn0Gi3cF/jLjpprrnc43OApkZ1uM9THkHS19WbT2UyCd36sQsZVpoXNwfbxGU6fIaDIODDL1JLeC67kZooj6qFuMxkjLi8RnIYaB2ZZqi54PBYTPLUTEDF68kjNnJuve3sn9blU1QycbOW63hNMmBYTBSEbmX3PgaeJVB6gaWgceDpWZpDlMBIAQGRmylKVRLRXC3YwpOUTZqIgm7E+S1VYymOpcUtLSp5CBKKFeoFz6i6OHj946M1nhl05o6dp/3DvPCsSajtTCDytVbn+2ybvDDL0NE/OlM4T8CwiM0DokRDOLD3YZSVDVqw7EY+WNsyWfMPMM52Rk/sqyoenkknOLNHtNQOdXZ//ThCEgtqLevZ8evovH4Ma09yuwP5vBcs43acQRM7SSVNWNQCz0A8UQfpjvSill5OO9Dgo2vZTVQBAZhmMg+wtAW6qwU7JV+0ZOirZvj/ScRQMncoFQClPhDt+/7NY8+HiCVf5r1127M2n5BKfoURKrp7T98m2ZDCoMySYlRNmRUSeL9anKZEoimlbQrSlnzH+bCZrNxFCU2pMLvBZyTBwpoW7eTxoJfoIobH2pnjbgXjL/siBnTweBkFSlXCqu1k5+TfqLND1VEFJaWTX/6HDzRnLwpErY8zJGXlWnQNdLlf6BSWcccy3mswNBzBTmuQtFwTJVBVLUwhBKjq4LS9mISKhIiJYlsktixu6XFLOOHONuVg7fpgpURRFyA5InOfVyMxe9afjHJ1OJyIwxgGACgLnDAGRIE/T/cEpCmMsHo8X+krQMhFtN5wJE2m/yCyTUgERgZBUMkELCgWni4WDRJJhMPs5F6/jWWkK2lwZGOOiKDrdLsYsJCQntyM2Zaa8H4Yky7fcurS8pMiyLCRA+icghBCCABwBinw+xhnnnFuWr6xMYKYV6RMcToJICAEASmma8VCKBCmldpy22xGRUoFSSuz03zYmUZQ0Xbt+wQ0zZs0+fOigltQ4cE3VRFEA4JqqEYKqmhQEAQAVRZFkafr0a9ra27s6uzjjmqbKsqyn9EQ8YRgGIjqdjg0bXuCcfbP32+Lioueee/bUqVNdXad1VVUUhTEmSVIkEhYEgQo0Eo4QQhKJhCAIhGAkGiGUAEAkGkkmknbnNFDGWLHPd/nUKwihnMOJ48fKy8snNDScOX1adsiNl16mJpP/NHlKMBhkjM2cNau7u1tT1fa2tnHjLqyurho7blxrW+vIkf758+ePrPW3tJwyTeu6OXOuvOKKAwe+O32m+5abl/z1yy87OtoXLVp00003pYxUZ2fn7ctvDwR6o9HonXcsj8cT06ZdHQ6HYopy661L40pc1/WV99wzb951hJJTp1oFQQAAYllWY+Okjo7O3/32vYsmNFCBFhUXT71qmmGYoijPmzdPT+lDKivnz79+zty51TU1qppccsst3sLCC0aPXr78jsrKyvr6+pUr77Msa9KkS++9/z4OoGlaW1v7Q//+kMdToKpqLKbcvmzZNTNmHD9+fM2aNaNHjy4uKl798Oq777pr0qRJvb29q1bd7yspURRl5T13+/3+xx9/rK6u7uTJ5tLSUtOybOETQRTq6usVJWqYhqewYIS/JqYoiWSCAzcMIxwOA8Jbb20tLS0bM3bsL9943TTMaCSSShmU4NfffL3l9S2NjY2HDh96Y8sbzz733Kj6ev9IPyHkfzb9Ip5Q1q5enTLMQm/h5ClTOju7GGNKLDZv7tx169Y7nY4bFtzwo9VrlLgSCoV0XbdMq7c3kEgmgn3BsvJSWZa++uprgdqpNSe1dXWy01FVVT1z9rVKPD5+/ARELPR4BEHwer2yw8EsVlZaTggyy6qp8RumaVoW40wQRE1VCSGKEvd6vUiwoqLCMM1kMsk4j0ai69Y9Uz9qVFlZaTwRtxizLLO5ufntd3799jvv+P1+UZI0VRs7ZoxpGB6Px+Fw+ny+0rJSQRJffPHlF198qa6ufuPGjaIkMotxAGHatGnHjjR99Mc/AUBVdfWy22//bt++9ra2lfc/YOg6syy3271gwY179nylKLHFi//l9dc3C5QSQlj/tWPHjlWr7n/iySd9Pt+uXbs6OzpEQSgq8p44fuLVjRsfWftIIp7YunXrA6tWeQoK3G7XM4cOPvHE45/t2HGqpWX9unULFi787LMdLzz/bHNLMyJwxteuXT2kolKW5YMHDui6Lksy5xxrav2hvj4toXEEyzKHDx/e19dnmmZtXX0wGKBINF0vKyttbW1NpVK1tbWxWKzQ4+np6S0oKKAC7Qv2GYbhcDlHXzA6Ho+1tJyiVKivqw0EAtFoTNO1MaNHB4LBQG/AP9JfX1/X1tYeDAbr6+qampoUJd7YeMmZ7u7ent7Lp07p7u5GJKFQiBAysaEhZaT2/22/ZTFBoOmwIIpi2pMBNwxDoAIApFIpQRA4MIKEcS7LMgDomm73FASBcUYJpQLlnJumqWu6JImy7GCMGaYhiiJBYo8jSRIhRNVUI2U4ZJkKNJUyXC4ncEiqqiRJhJJ4PC6KEiWEUjQtS1U1SZQ8ngLEdLKETqdzoNSTdvUInBNC+mk+IBLOGAAQSvtpFAMAggMpF6UUABhntvO38y1EJITYHJwQYisMAEcknDNApIQwlnb1djSyJ7UXyRgbCF2yQz47D0QcRMExiysAENKfDPC8temzeEJ2fTon7cx3RgWD6ycICEgGl30h70ENz1QuOQBnmS/sDcBMoWVQdS5TKch7fJJTQ849P8lp55AuL+Q97DnnkRjPPukAIAMVD5u+ZA+WReAHFjHoSITz/NlSOjfJKelkKGiGDnLMOXHqZ2RZIDhwhv1f5MyUexLEs8ju2UlSvoMoHLQGzhkH/v+Ti6UGcSSmrAAAAABJRU5ErkJggg==";
const FAVICON_B64="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAHXUlEQVR42oVWaWxU1xU+595335sZxuNZ7Bnb2OCFscEYm9qQQE0MJEpJU0UQKqBSo9KmkVCXKI2iRGmTKvyqWjVdpG4SUtOqVaQuKgkIqjbQFHWB0ARiQxPANHbs8YZn8Tbre+/e0x+zeMY47f3xdDedc993zvedgx6PB4sDEBBweQkAAKX9wpJhab584aMHq1hR2ZRo1f2KeYWf/+eg3OJqc0IARIDiERHljwoX6KMdUP4Qyyze/RwCW1HWUpKIswIqiAgMacXvrnBQeMXyA6gMUiqiDMjQt0a01DiFxmeiC9lsjmsMACibBSVLt+/2ww3DYMgAlsNbmuffyBmaloxF5x7qrn/50c4DO1v3Htx97XZ8cjKmge3+6jdgetxOxFHTCuixiqCzcpQr0ae8g+h8akOj7ztPPvLioXt/ff7fz//0jzW13ot/O/HY3nZzxwNGd481MY5CJ6UAARBA0co/KM/LiiRlmMxkn//cwDOPPzg3MXPZ1fT23s++PZ1+5Vsnpm++P7Cz88LA562ffVtFxtDpACKgYjaXpfUqWZRPD0RI5awndrcblvXgF35w7IenT4yxO/XtwS8e23fr9pnhxac+9HRAwnv9snRXo1QVRgiIKB9XdLvdWDEAADnDtE0fC+qhatfJd0Yb93yi++mve+7dfvXJJ4Z//5u2F7/Z1NacaGhr+/6zn6rXnj7zQZVg5cAsUw+R67qOiAV+FkEiZLqVbuve9s8o1A880PbU8bEzv1scHGp6+Gj1hnDkR9/t2PeQkU3++eWfHPtk1+SC+cGdpEPny+ErgyjvAIpMwLwzWyqfS18KbfYOPOpqbB393nNjfzpdHVxnzS9myDz46i+NxfnhsYhq3wIX/7Lv/p7XL464HWIFGQpxhGVulpIHwTbtqtDsrSEzHhOpLCzNd3768Y6jz7hCLbOv/XZ+fMId7hj/xSudhw8e+tpj4XV+Q2N3MyAfD3S73eWKhoiMMakkd3mc67qcNWsRpb93L0lz9h9/SEbjbQc+UxeuX5iJeHfszAVqj+OVZ4++dG103uXQV+WzRkAISERF3EgphciVmdO9oezMaHZxzlnXPvrqcVd9MwAX1cHorcjU5b92D+y589rpn8/8SwmHkopIrSp4GlVuEwASAJKUNinMxSfdzb3xS6e8m3a0HH3JBloaeiO7MNt0//73Xngu9Mgh0x9CcxAYIqJSdLd0szIdJAICAkICIGmZpNDZsFlU1WSikaquvbm5eGZ2xtUYTrx7ybu+o/nhI8Lji03HUqmsxnneiCK1moOC6hbEokBIaZNUwrsWiEnbJgnmfEJlc7p/LUiLtDXu1i5iIjY+vZi2GUNSBW5RpQ8uNAEMkQoqUUovqWwUzqX/XGIur8wsKCJHbYtRHVh6/+9meklzeoZ+/AI5XNn33l1cTENZ+SOCvBDksedCiCIxyrSIMZI2ocZ1zcplHJ5A7NqbUikzNjZz7ldV4T4rMW1lFzTdmRi6CpoBQCUVKq9wiIgulwsZAiAQlScrkZLIjaqAtRjTOFfSssyMxjVhOC2pDKdDa2yBxXkrOsOEfldxXk4dLoTIZXOIyDUOiECAjCEAYwyUBGUKxgCJa8JwrEEucrmc0+FIJZNoWyydRI0XrTMs6xg4L5QyTkSbuzYjZwvzC/koW6aJiMlkclNnZ2tLy40bN4QQlmmmUkmvt7q3r3dkZOTj/TsXYrFYLM6QSWkDQM7MKqmIyLYtKeXSUtLQBSJqgHDf7j3Dt4YTsXhtsDaTydTW1CZTKSltxlk8Hu/t7U2lUw6HIxgKDl4d/MqXvzQ9M93Ts3UiMtnX1zceiQgh5hKJpqamVCqVSMz5/F6laGtPzxvnzmXSGb4hHDZNU0pb6KKuvsFhGMG6ura21vXNLZZphULBvr5tjLNwOFwXqvN4PFXuqnC4fXZ2trGxsWdrz6aNGxljR44cicfjPT090Wj0wP79/f39qXTq+vXrUkrWtG5dY1NTc2urzx+wTJNzbXp6KpPJANBEJOJwOG/evDEyMjIxMXHy5MmuLV1vXb48ORHZ1d8fDAWj0djw8O2hoaH169e/c+WKUoqI0pn02bNn1zY0hIIhyzJ53/Ztb54/n0ln/F6v1+fv2Nhh5UwgtGwrUBPI5XJCiMHBoV337dp+zz1vXbrk9/tfP3Wqq6vrwoUL27b1fTg62lBfH41FfT6frosjhw9PTU0T0ZYt3VevXrlzZxarfd6lhUXGmWEYnGtCaFJK27ZsW3qqqrLZnKZpqVTK6XS63e5oNBoI+OOJuTVrXKlUqqGhnggs00wkEj6fP5vL1gQC8XjcH/BrXJucmjJ0A3Vd55wX2zQiImTIGEdARYoxhoCcc9u2AUAIIaXUNE0pxTk3TTMv75rQpC0R0bZtXReWZSEywzCICB0Ox7Iw5RlX4iJDRMxrYemoXE5KXyJa2S8XO0TOOS9jIFYUvLxCskIrRgD/s4+uKGVUFA+WLzJQEIuVPW9eHhGBiIqNL5UJcOlLZe0wlncu/wVjm7+dCLbGkAAAAABJRU5ErkJggg==";

const ICFG={
  NOISE:{color:"#486080",bg:"rgba(72,96,128,0.08)",bar:"#243347"},
  LOW:{color:"#4890f8",bg:"rgba(72,144,248,0.07)",bar:"#1850b0"},
  MODERATE:{color:"#f09020",bg:"rgba(240,144,32,0.07)",bar:"#906020"},
  HIGH:{color:"#f04040",bg:"rgba(240,64,64,0.07)",bar:"#6c1c1c"},
  CRITICAL:{color:"#ff1840",bg:"rgba(255,24,64,0.06)",bar:"#980020"},
};
const SC={"RISK-ON":"#28cc78","RISK-OFF":"#f04040","NEUTRAL":"#486080","MIXED":"#f09020"};
const DC={BULLISH:"#28cc78",BEARISH:"#f04040",NEUTRAL:"#486080"};

const TIER1=["XAU/USD","XAG/USD","WTI/USD","SPX","NDX","DX","VIX"];
const TIER2=["EUR/USD","GBP/USD","USD/JPY","AUD/USD","GBP/JPY","US10Y","US02Y","DJI","RUT"];

const INSTRUMENTS=[
  {s:"XAU/USD",l:"GOLD",      b:3230, cat:"Commodities",grp:"Metals", roro:"OFF",v:0.004,tier:1},
  {s:"XAG/USD",l:"SILVER",    b:32.14,cat:"Commodities",grp:"Metals", roro:"OFF",v:0.005,tier:1},
  {s:"WTI/USD",l:"OIL WTI",   b:61.85,cat:"Commodities",grp:"Energy", roro:"ON", v:0.005,tier:1},
  {s:"SPX",    l:"S&P 500",   b:5320, cat:"Indices",    grp:"US",     roro:"ON", v:0.003,tier:1},
  {s:"NDX",    l:"NASDAQ 100",b:18540,cat:"Indices",    grp:"US",     roro:"ON", v:0.004,tier:1},
  {s:"DJI",    l:"DOW 30",    b:39820,cat:"Indices",    grp:"US",     roro:"ON", v:0.003,tier:2},
  {s:"RUT",    l:"RUSSELL 2K",b:1980, cat:"Indices",    grp:"US",     roro:"ON", v:0.005,tier:2},
  {s:"DX",     l:"DXY",       b:99.82,cat:"Indices",    grp:"USD",    roro:"OFF",v:0.002,tier:1},
  {s:"VIX",    l:"VIX",       b:21.50,cat:"Volatility", grp:"VIX",   roro:"OFF",v:0.025,tier:1},
  {s:"EUR/USD",l:"EUR/USD",   b:1.1042,cat:"Forex",    grp:"Majors", roro:"MIX",v:0.002,tier:2},
  {s:"GBP/USD",l:"GBP/USD",   b:1.2985,cat:"Forex",    grp:"Majors", roro:"MIX",v:0.002,tier:2},
  {s:"USD/JPY",l:"USD/JPY",   b:143.25,cat:"Forex",    grp:"Majors", roro:"OFF",v:0.002,tier:2},
  {s:"AUD/USD",l:"AUD/USD",   b:0.6312,cat:"Forex",    grp:"Majors", roro:"ON", v:0.002,tier:2},
  {s:"GBP/JPY",l:"GBP/JPY",   b:186.10,cat:"Forex",    grp:"Crosses",roro:"ON", v:0.002,tier:2},
  {s:"US10Y",  l:"US 10Y",    b:4.38,  cat:"Bonds",    grp:"Yields", roro:"OFF",v:0.006,tier:2},
  {s:"US02Y",  l:"US 2Y",     b:4.02,  cat:"Bonds",    grp:"Yields", roro:"OFF",v:0.008,tier:2},
];

const FILTER_CATS=["All","Risk-On","Risk-Off","FX","Bonds"];
const DEFAULT_QUAD=["XAU/USD","SPX","DX","WTI/USD"];
const SAMPLES=[
  "Federal Reserve surprises with emergency 50bps rate cut amid banking stress",
  "US CPI comes in at 3.8% vs 3.5% expected, core inflation remains sticky",
  "Iran closes Strait of Hormuz following US airstrike on oil facilities",
  "China PMI falls to 48.2, below the 50 contraction threshold",
  "Russia halts natural gas supply to three European nations",
  "US NFP jobs data comes in at 150k vs 200k expected",
];

const AI_SYS=`You are an elite macro financial analyst and geopolitical strategist. Respond ONLY with valid JSON:
{"impactScore":<0-100>,"impactLevel":"<NOISE|LOW|MODERATE|HIGH|CRITICAL>","marketSentiment":"<RISK-ON|RISK-OFF|NEUTRAL|MIXED>","sentimentShift":"<BULLISH|BEARISH|NEUTRAL>","immediateImpact":"<2-3 sentences>","moneyFlow":"<2 sentences on institutional money movement>","geopoliticalCascade":"<2-3 sentences: full transmission chain>","affectedInstruments":[{"symbol":"<sym>","direction":"<BULLISH|BEARISH|NEUTRAL>","confidence":<0-100>,"currentPrice":<number>,"targetLevel":<number>,"reason":"<one sentence>"}],"keyDrivers":["<d1>","<d2>","<d3>"],"edgeFinderOverride":{"triggered":<true|false>,"reason":"<why geopolitical conditions override scoring model>"},"edgeFinderCrossCheck":{"hasData":<true|false>,"cotAlignment":"<CONFIRMS|CONTRADICTS|MIXED|N/A>","cotNote":"<1-2 sentences: what COT data shows vs the event, or N/A>","setupAlignment":"<CONFIRMS|CONTRADICTS|MIXED|N/A>","setupNote":"<1-2 sentences: what top setups show vs event direction, or N/A>","keyContradiction":"<the single most important conflict between EdgeFinder data and the news event, or null>","resolution":"<2 sentences: how to reconcile conflicting signals, which to prioritize and why>","tradeVerdict":"<EDGEFINDER WINS|NEWS WINS|WAIT FOR CONFIRMATION|SPLIT — explain briefly>"},"scenarios":[{"type":"BEARISH_EXTREME","title":"<n>","probability":<0-100>,"timeline":"<e.g. 2-5 days>","description":"<2 sentences>","watchFor":"<trigger>","instruments":[{"symbol":"<sym>","move":"<e.g.+8%>"}]},{"type":"BASE_CASE","title":"<n>","probability":<0-100>,"timeline":"<e.g. 1-3 days>","description":"<2 sentences>","watchFor":"<trigger>","instruments":[{"symbol":"<sym>","move":"<e.g.+3%>"}]},{"type":"BULLISH_REVERSAL","title":"<n>","probability":<0-100>,"timeline":"<e.g. 1 week>","description":"<2 sentences>","watchFor":"<trigger>","instruments":[{"symbol":"<sym>","move":"<e.g.-2%>"}]}],"keyLevelsToWatch":[{"symbol":"<sym>","level":<number>,"significance":"<why critical now>"}],"traderNote":"<3-4 sentences actionable>","timeHorizon":"<INTRADAY|SHORT-TERM|MEDIUM-TERM|LONG-TERM>","nextCatalysts":["<event1>","<event2>"]}
Probabilities sum to 100. List 3-5 affected instruments. List 3 key levels. Always explain full transmission chain. If EdgeFinder screenshots are attached, read the COT data, top setups, and any positioning data shown, then fill edgeFinderCrossCheck.hasData=true and provide a full cross-analysis highlighting contradictions. If no images provided, set hasData=false and all alignment fields to "N/A".`;

const INST_NEWS_SYS=`You are a concise market analyst. Search the web for the latest news and analysis for the given instrument. Be brief and factual.

Respond ONLY with valid JSON:
{"news":[{"time":"<e.g. 2:45pm May 4>","src":"<source>","headline":"<headline>","sentiment":"<BULLISH|BEARISH|NEUTRAL>","sentimentColor":"<#22d46e|#f04545|#f0a020>","body":"<2-3 sentences: what happened and why it matters>","tags":["<tag1>","<tag2>"]}],"brief":"<3-4 sentences: current macro drivers, key levels, what to watch tonight. Bold key terms with **double asterisks**.>","keyLevels":{"support":<number>,"resistance":<number>,"note":"<1 sentence>"}}

Provide 3-5 news items, most recent first. Keep each body to 2-3 sentences max.`;

const CTX_SYS=`You are a senior market analyst with live web search access. Your ONLY job is to report what has happened in the LAST 60 MINUTES from the exact current time provided in the user message. This is a time-sensitive breaking news briefing — not a macro summary.

CRITICAL SEARCH INSTRUCTIONS:
- Search for news published within the LAST 60 MINUTES of the timestamp in the user message
- Use the exact current time to anchor your search: "Gold news last hour", "market headlines last 60 minutes", "breaking financial news [current hour]"
- DO NOT repeat context from earlier in the session — only report what is NEW since the last hour
- If the same macro theme (e.g. Iran tensions) continues but nothing NEW happened, say "No new developments on [topic] in the last hour"
- Search specifically for: Gold price moves in last hour, any new Fed speaker comments, any new geopolitical headline, any economic data that just printed, any central bank statement, USD/JPY and DXY moves in last hour

Respond ONLY with valid JSON:
{"sessionBias":"<RISK-ON|RISK-OFF|NEUTRAL|MIXED>","currentTime":"<exact SGT time from user message>","regimeUpdate":"<1 sentence: what specifically changed in the LAST HOUR — not general session context>","breaking":[{"time":"<exact SGT time this happened>","type":"<ECONOMIC DATA|FED SPEAKER|CENTRAL BANK|GEOPOLITICAL|MARKET MOVE>","typeColor":"<ECONOMIC DATA=#22c55e, FED SPEAKER=#818cf8, CENTRAL BANK=#fb923c, GEOPOLITICAL=#ef4444, MARKET MOVE=#3b82f6>","headline":"<specific factual headline with exact time — what actually just happened>","impact":"<BULLISH GOLD|BEARISH GOLD|BULLISH USD|BEARISH USD|RISK-ON|RISK-OFF|NEUTRAL>","detail":"<2-3 sentences: exactly what happened, specific numbers, why it matters NOW>","goldReaction":"<exact Gold price movement in response — be specific e.g. Gold moved from $X to $Y>","tradingNote":"<1 sentence: most actionable thing to do RIGHT NOW based on this development>"}],"marketMoves":[{"symbol":"<sym>","from":"<price>","to":"<price>","change":"<+/-amount>","direction":"<up|down>","timeframe":"<last X minutes>","note":"<1 sentence: what specifically caused this move in the last hour>"}],"nextUp":[{"time":"<SGT>","event":"<specific upcoming event>","impact":"<HIGH|MEDIUM>","note":"<1 sentence why it matters for the next 1-2 hours>"}],"goldBias":"<BULLISH|BEARISH|NEUTRAL>","dxyBias":"<BULLISH|BEARISH|NEUTRAL>","sessionSummary":"<2 sentences: what specifically changed in the LAST HOUR and what traders should focus on for the NEXT hour — not general session overview>","nothingNew":"<true if nothing material happened in last 60 min — if true, say what to watch instead>"}
RULES: 1-3 breaking items of GENUINELY NEW developments only. If nothing new happened in the last hour, set nothingNew to true and provide 1 item explaining what ongoing risk to monitor. Provide 3-4 market moves with timeframes. Provide 2-3 next up items. NO background macro context — only what changed in the last 60 minutes.`;
const INTEL_P1_SYS=`You are a senior macro strategist at a top investment bank. Generate PHASE 1 of a pre-session intelligence briefing — situational awareness only. Be CONCISE. Max 2 sentences per text field. Max 3 items per array. Short, punchy, factual.

Search the web RIGHT NOW for: breaking geopolitical headlines, overnight Asia and Europe market performance, VIX current level, latest economic calendar events this session, active alerts or risks.

Respond ONLY with valid JSON:
{"session":"<ASIA OPEN|LONDON OPEN|NY SESSION>","generatedAt":"<time SGT>","validFor":"<window>","marketRegime":"<RISK-ON|RISK-OFF|NEUTRAL|MIXED>","regimeDrivers":"<1-2 sentences: what is driving the regime RIGHT NOW>","headline":"<single most important theme tonight>","executiveSummary":"<2-3 sentences: what happened overnight, current picture, biggest risk tonight>","alerts":[{"priority":<1,2,or3>,"type":"<INTERVENTION RISK|BINARY EVENT|GEOPOLITICAL|DATA RISK|CENTRAL BANK>","color":"<#ff1840 for P1|#f0a500 for P2|#fb923c for P3>","headline":"<specific alert>","detail":"<2 sentences: context and probability>","monitor":"<1 sentence: exact trigger level or event to watch>"}],"overnightRecap":{"asia":{"summary":"<1-2 sentences: key Asia session moves>","keyMove":"<e.g. Nikkei -0.8%, Gold flat>"},"europe":{"summary":"<1-2 sentences: key Europe session moves>","keyMove":"<e.g. FTSE +0.4%, EUR/USD -0.2%>"},"usFutures":{"direction":"<HIGHER|LOWER|MIXED>","spx":"<e.g. +0.1%>","ndx":"<e.g. -0.2%>","note":"<1 sentence>"},"sessionHL":{"gold":{"high":<number>,"low":<number>},"dxy":{"high":<number>,"low":<number>},"usdJpy":{"high":<number>,"low":<number>}}},"vixSnapshot":{"level":<number>,"change":"<+/-X.X>","chgPct":"<+/-X.X%>","label":"<CALM|NORMAL|ELEVATED|HIGH FEAR>","labelColor":"<hex>","interpretation":"<1-2 sentences: what VIX level means for tonight>","impactOnGold":"<1 sentence: how VIX affects Gold trading tonight>"},"calendar":[{"time":"<SGT>","flag":"<emoji>","event":"<name>","stars":<2or3>,"forecast":"<value or —>","prev":"<value or —>","impact":"<CRITICAL|HIGH|MEDIUM>","goldBull":"<bullish condition>","goldBear":"<bearish condition>","analysis":"<1 sentence>"}]}

ALERT RULES: Only include genuinely active risks. 0-3 alerts max. P1=imminent, P2=session-long, P3=background.
CALENDAR RULES: ASIA=JPY/AUD/NZD/CNY only. LONDON=EUR/GBP/CHF only. NY=USD/CAD only. 2-star and 3-star only. Max 3 events.
SESSION H/L: Use approximate values based on live data provided. If unavailable use 0.`;

const INTEL_P2_SYS=`You are a senior macro strategist. Generate PHASE 2 deep analysis for a pre-session trading briefing. Be STRICTLY CONCISE — maximum 2 sentences per text field, maximum 3 items per array. No exceptions.

NO web search needed — use the Phase 1 context and your knowledge of current macro conditions.

Respond ONLY with valid JSON:
{"inflationRisk":{"level":"<HIGH|ELEVATED|MODERATE|LOW>","color":"<#f04545 for HIGH|#f0a020 for ELEVATED or MODERATE|#22d46e for LOW>","realYield":"<e.g. 1.82%>","drivers":["<driver1>","<driver2>"],"goldImplication":"<1-2 sentences max>","fedCutProb":"<e.g. July: 38% · Sep: 62%>"},"centralBanks":{"fed":{"rate":"<rate>","nextMeeting":"<date>","cutProb":"<e.g. July 38%>","recentSignal":"<1 sentence>","goldImpact":"<1 sentence>"},"boj":{"rate":"<rate>","nextMeeting":"<date>","hikeProb":"<e.g. June 35%>","recentSignal":"<1 sentence>","goldImpact":"<1 sentence>"},"ecb":{"rate":"<rate>","nextMeeting":"<date>","cutProb":"<e.g. June 78%>","recentSignal":"<1 sentence>","goldImpact":"<1 sentence>"},"whichMattersTonight":"<1 sentence>"},"macro":[{"heading":"<heading>","color":"<hex>","body":"<2 sentences max>","keyData":"<3 data points separated by ·>"}],"liquidityAssessment":{"sessionLiquidity":"<e.g. NORMAL>","thinPeriods":"<e.g. After midnight SGT>","goldSpread":"<e.g. $0.30-0.50>","note":"<1 sentence>"},"positionManagement":{"maxRiskPerTrade":"<e.g. 1.5% max>","stopDistance":"<e.g. Gold min $25>","avoidHours":"<e.g. After 12:30am SGT>","newsRule":"<1 sentence>","note":"<1 sentence>"},"instruments":[{"name":"<name>","color":"<hex>","price":"<price>","bias":"<BULLISH|BEARISH|NEUTRAL|AVOID LONGS|WATCH>","conviction":"<HIGH|MEDIUM|LOW>","summary":"<2 sentences max>","levels":{"s2":<n>,"s1":<n>,"now":<n>,"r1":<n>,"r2":<n>},"setup":"<1-2 sentences: entry stop target or NO SETUP>","avoid":["<condition1>"]}],"watchlist":[{"symbol":"<sym>","price":"<price>","bias":"<bias>","priority":"<CRITICAL|HIGH|MEDIUM>","color":"<hex>","note":"<1 sentence>"}],"tradeFocus":"<3 sentences max: primary opportunity, what to avoid, most important level tonight>"}

RULES: Max 3 macro sections. Max 3 instruments. Max 4 watchlist items. Max 3 array items anywhere. Keep ALL text fields to 1-2 sentences. This is critical for performance.`;


const dp=function(b:number){return b>=1000?2:b>=10?3:4;};
const fmt=function(v:any,b:number){
  if(v==null)return"—";
  return v.toLocaleString(undefined,{minimumFractionDigits:dp(b),maximumFractionDigits:dp(b)});
};
const vixClr=function(v:number){return v<15?"#28cc78":v<20?"#e8c858":v<30?"#f09020":"#f04040";};
const vixLbl=function(v:number){return v<15?"CALM":v<20?"NORMAL":v<30?"ELEVATED":"HIGH FEAR";};

// Seeded RNG — same seed = same chart always, no flickering
function seededRand(seed:number){
  var x=Math.sin(seed+1)*10000;
  return x-Math.floor(x);
}
function genFB(base:number,vol:number,pts?:number,seed?:number){
  pts=pts||48;
  var s=seed||Math.round(base*100);
  var data:any[]=[];var now=Date.now();
  var dailyRange=Math.max(vol*2,0.002);
  var trendDir=seededRand(s)>0.5?1:-1;
  var trendStrength=dailyRange*(0.3+seededRand(s+1)*0.7);
  var startPct=trendDir*(-trendStrength*0.8);
  var p=base*(1+startPct);
  var momentum=0;
  for(var i=0;i<pts;i++){
    var r1=seededRand(s+i*3);
    var r2=seededRand(s+i*3+1);
    var r3=seededRand(s+i*3+2);
    momentum=momentum*0.92+(r1-0.5)*dailyRange*0.12;
    var maxMom=dailyRange*0.3;
    if(momentum>maxMom)momentum=maxMom;
    if(momentum<-maxMom)momentum=-maxMom;
    p=p*(1+momentum);
    var maxDev=base*(dailyRange*1.5);
    if(p>base+maxDev)p=base+maxDev-r2*base*0.001;
    if(p<base-maxDev)p=base-maxDev+r2*base*0.001;
    var mins=pts===48?30:pts===168?60:pts===360?120:360;
    data.push({
      t:new Date(now-(pts-1-i)*mins*60*1000).toLocaleDateString([],{month:"short",day:"numeric"}),
      p:parseFloat(p.toFixed(dp(base)))
    });
  }
  // Last point = actual current price ± tiny noise
  data[data.length-1].p=parseFloat((base*(1+(seededRand(s+999)-0.5)*0.0005)).toFixed(dp(base)));
  return data;
}

function samplePts(data:any[],max:number){
  if(!data||data.length<=max)return data;
  var step=(data.length-1)/(max-1);
  var out=[];
  for(var i=0;i<max;i++)out.push(data[Math.round(i*step)]);
  return out;
}

// ── EXPANDED VIEW HELPERS ─────────────────────────────────────────────────
function calcFearGreed(mkt:any[]):number{
  var vix=mkt.find(function(m){return m.s==="VIX";});
  var spx=mkt.find(function(m){return m.s==="SPX";});
  var gold=mkt.find(function(m){return m.s==="XAU/USD";});
  var score=50;
  if(vix)score+=vix.cur<15?15:vix.cur>30?-20:(20-vix.cur)*0.8;
  if(spx)score+=Math.max(-20,Math.min(20,spx.pct*8));
  if(gold)score+=Math.max(-10,Math.min(10,gold.pct*-3));
  return Math.max(0,Math.min(100,score));
}

function calcCorrelation(a:any[],b:any[]):number{
  var n=Math.min(a.length,b.length,20);
  if(n<3)return 0;
  var d1=a.slice(-n).map(function(v:any){return v.p;});
  var d2=b.slice(-n).map(function(v:any){return v.p;});
  var m1=d1.reduce(function(s:number,v:number){return s+v;},0)/n;
  var m2=d2.reduce(function(s:number,v:number){return s+v;},0)/n;
  var cov=0,var1=0,var2=0;
  for(var i=0;i<n;i++){cov+=(d1[i]-m1)*(d2[i]-m2);var1+=(d1[i]-m1)**2;var2+=(d2[i]-m2)**2;}
  return var1*var2>0?cov/Math.sqrt(var1*var2):0;
}

function calcVolProfile(data:any[]):{buckets:any[];poc:number;mn:number;mx:number}|null{
  if(data.length<4)return null;
  var mn=Math.min.apply(null,data.map(function(d:any){return d.p;}));
  var mx=Math.max.apply(null,data.map(function(d:any){return d.p;}));
  var rng=mx-mn||0.01;
  var N=7;var bsz=rng/N;
  var bkts=Array.from({length:N},function(_:any,i:number){return{lo:mn+i*bsz,hi:mn+(i+1)*bsz,mid:mn+(i+0.5)*bsz,ct:0};});
  data.forEach(function(d:any){var idx=Math.min(N-1,Math.floor((d.p-mn)/bsz));bkts[idx].ct++;});
  var maxCt=Math.max.apply(null,bkts.map(function(b:any){return b.ct;}))||1;
  var poc=bkts.reduce(function(best:any,b:any){return b.ct>best.ct?b:best;},bkts[0]);
  return{buckets:bkts.map(function(b:any){return Object.assign({},b,{pct:b.ct/maxCt*100});}).reverse(),poc:poc.mid,mn,mx};
}

function calcKeyLevels(data:any[],cur:number):{r2:number;r1:number;cur:number;s1:number;s2:number}{
  var highs:number[]=[],lows:number[]=[];
  for(var i=2;i<data.length-2;i++){
    if(data[i].p>data[i-1].p&&data[i].p>data[i+1].p&&data[i].p>data[i-2].p&&data[i].p>data[i+2].p)highs.push(data[i].p);
    if(data[i].p<data[i-1].p&&data[i].p<data[i+1].p&&data[i].p<data[i-2].p&&data[i].p<data[i+2].p)lows.push(data[i].p);
  }
  var res=highs.filter(function(p){return p>cur;}).sort(function(a,b){return a-b;});
  var sup=lows.filter(function(p){return p<cur;}).sort(function(a,b){return b-a;});
  var fb=cur*0.003;
  return{r2:res[1]||cur+fb*2,r1:res[0]||cur+fb,cur,s1:sup[0]||cur-fb,s2:sup[1]||cur-fb*2};
}

function initMkt(){
  return INSTRUMENTS.map(function(inst){
    var ch=genFB(inst.b,inst.v);var open=ch[0].p;var cur=ch[ch.length-1].p;
    return Object.assign({},inst,{ch:ch,open:open,cur:cur,chg:cur-open,pct:(cur-open)/open*100,live:false,src:"SIM"});
  });
}

function callProxy(body:any,onSuccess:Function,onError:Function){
  var xhr=new XMLHttpRequest();
  xhr.open("POST","/api/analyze",true);
  xhr.setRequestHeader("Content-Type","application/json");
  xhr.timeout=body.useWebSearch?295000:120000;
  xhr.onload=function(){
    try{
      var raw=(xhr.responseText||"").trim();
      if(!raw.startsWith("{")&&!raw.startsWith("[")){
        onError("Server error (timeout or gateway): "+raw.slice(0,180));return;
      }
      var d=JSON.parse(raw);
      if(d.error){
        var eType=d.error&&d.error.type;
        var eMsg=eType==="overloaded_error"?"Anthropic API overloaded — please try again in 1–2 min":
          eType==="rate_limit_error"?"Rate limit hit — please wait 30 seconds and retry":
          typeof d.error==="string"?d.error:JSON.stringify(d.error);
        onError(eMsg);return;
      }
      var txt=(d.content||[]).map(function(x:any){return x.type==="text"?x.text:"";}).join("");
      if(!txt){onError("Empty response — web search may be unavailable, retry");return;}
      var clean=txt.split("```json").join("").split("```").join("").trim();
      var s=clean.indexOf("{"),ef=clean.lastIndexOf("}");
      if(s!==-1&&ef>s){clean=clean.slice(s,ef+1);}
      else{onError("AI returned plain text instead of JSON: "+clean.slice(0,160)+"…");return;}
      onSuccess(JSON.parse(clean));
    }catch(e:any){onError("Parse error: "+e.message);}
  };
  xhr.onerror=function(){onError("Network error");};
  xhr.ontimeout=function(){onError("Request timed out — web search takes up to 60s, please retry");};
  xhr.send(JSON.stringify(body));
}

function ChartTip(props:any){
  if(!props.active||!props.payload||!props.payload.length)return null;
  return <div style={{background:"#1a2035",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"10px",fontSize:11,boxShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>
    <div style={{color:"#e8d5a3",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>{props.payload[0]&&props.payload[0].value!==undefined&&props.payload[0].value.toLocaleString()}</div>
    <div style={{color:"#8892a4",marginTop:3,fontSize:10}}>{props.label}</div>
  </div>;
}

// ── RORO + SESSION HELPERS ────────────────────────────────
function calcROROScore(mkt:any[]){
  var score=50;
  var vix=mkt.find(function(m){return m.s==="VIX";});
  var dxy=mkt.find(function(m){return m.s==="DX";});
  var spx=mkt.find(function(m){return m.s==="SPX";});
  var gold=mkt.find(function(m){return m.s==="XAU/USD";});
  var usdjpy=mkt.find(function(m){return m.s==="USD/JPY";});
  if(vix){score+=vix.pct>1?-15:vix.pct<-1?15:vix.pct*-5;}
  if(dxy){score+=dxy.pct>0.3?-10:dxy.pct<-0.3?10:dxy.pct*-15;}
  if(spx){score+=spx.pct>0.5?15:spx.pct<-0.5?-15:spx.pct*10;}
  if(gold){score+=gold.pct>0.5?-8:gold.pct<-0.5?8:gold.pct*-5;}
  if(usdjpy){score+=usdjpy.pct>0.3?8:usdjpy.pct<-0.3?-8:usdjpy.pct*10;}
  return Math.max(0,Math.min(100,score));
}

function getROROLabel(score:number){
  if(score>=65)return{label:"RISK-ON",color:"#28cc78",desc:"Equities bid · Gold offered · JPY weak"};
  if(score<=35)return{label:"RISK-OFF",color:"#f04040",desc:"Gold bid · JPY strong · Equities offered"};
  return{label:"NEUTRAL",color:"#f09020",desc:"Mixed signals · No clear regime"};
}

function calcGoldBias(mkt:any[]){
  var gold=mkt.find(function(m){return m.s==="XAU/USD";});
  var dxy=mkt.find(function(m){return m.s==="DX";});
  var vix=mkt.find(function(m){return m.s==="VIX";});
  if(!gold||!dxy||!vix)return"NEUTRAL";
  var score=0;
  if(gold.pct>0.3)score+=2;if(gold.pct<-0.3)score-=2;
  if(dxy.pct<-0.2)score+=2;if(dxy.pct>0.2)score-=2;
  if(vix.pct>1)score+=1;if(vix.pct<-1)score-=1;
  if(score>=2)return"BULLISH";if(score<=-2)return"BEARISH";return"NEUTRAL";
}

function calcInflationRisk(mkt:any[]){
  var y10=mkt.find(function(m){return m.s==="US10Y";});
  var gold=mkt.find(function(m){return m.s==="XAU/USD";});
  var dxy=mkt.find(function(m){return m.s==="DX";});
  var score=50;
  if(y10){score+=y10.pct<-0.1?12:y10.pct>0.1?-12:0;}
  if(gold){score+=gold.pct>0.5?15:gold.pct>0.2?8:gold.pct<-0.5?-15:gold.pct<-0.2?-8:0;}
  if(dxy){score+=dxy.pct<-0.3?10:dxy.pct>0.3?-10:0;}
  score=Math.max(0,Math.min(100,score));
  if(score>=65)return{label:"HIGH INFLATION RISK",color:"#f04545",desc:"Gold bid · Real yields falling · Fed cut likely",score};
  if(score<=35)return{label:"LOW INFLATION RISK",color:"#22d46e",desc:"Real yields rising · Dollar strong · Gold headwind",score};
  return{label:"MODERATE INFLATION",color:"#f0a020",desc:"Mixed signals · Watch Fed & CPI closely",score};
}
function getSessionLabel(){
  var now=new Date();
  var sgt=new Date(now.getTime()+8*60*60*1000);
  var h=sgt.getUTCHours();
  if(h>=6&&h<8)return{label:"🌏 SYDNEY",color:"#40c8d0"};
  if(h>=8&&h<16)return{label:"🌏 ASIA/TOKYO",color:"#40c8d0"};
  if(h>=16&&h<20)return{label:"🌍 LONDON",color:"#4890f8"};
  if(h>=20&&h<21)return{label:"🤝 LDN/NY OVERLAP",color:"#e8c858"};
  if((h>=21&&h<=23)||(h>=0&&h<4))return{label:"🗽 NY SESSION",color:"#e8c858"};
  return{label:"💤 OFF-HOURS",color:"#243347"};
}

function getSessionKey(){
  var h=new Date(Date.now()+8*60*60*1000).getUTCHours();
  if(h>=6&&h<16)return"asia";
  if(h>=16&&h<21)return"london";
  return"ny";
}
function getSessionUnlockSGT(key:string):string{
  if(key==="asia")return"6:00 AM SGT";
  if(key==="london")return"4:00 PM SGT";
  return"9:00 PM SGT";
}
function isSessionActive(key:string):boolean{
  var h=new Date(Date.now()+8*60*60*1000).getUTCHours();
  if(key==="asia")return h>=6&&h<16;
  if(key==="london")return h>=16&&h<21;
  if(key==="ny")return h>=21||h<6;
  return false;
}
function getSessionLabel2(key:string):string{
  if(key==="asia")return"Asia Open";
  if(key==="london")return"London Open";
  return"NY Session";
}

const INST_NEWS_SYS_STREAM=`You are a concise market analyst. Based on your knowledge of current macro conditions (May 2026), provide a news brief. Respond ONLY with valid JSON starting with {, no markdown:
{"brief":"<2-3 sentence market summary>","items":[{"time":"<e.g. Today>","src":"<source>","headline":"<headline>","sentiment":"<BULLISH|BEARISH|NEUTRAL>","sentColor":"<#22d46e|#f04545|#f0a020>","body":"<2 sentences>"}],"keyLevel":{"support":<n>,"resistance":<n>,"note":"<1 sentence>"}}
3-4 news items.`;
const INST_ANAL_SYS=`You are a senior macro trader. Based on current macro conditions (May 2026), respond ONLY with valid JSON starting with {, no markdown:
{"bias":"<BULLISH|BEARISH|NEUTRAL>","biasColor":"<#22d46e|#f04545|#f0a020>","summary":"<2-3 sentence analysis>","drivers":["<d1>","<d2>","<d3>"],"levels":{"s2":<n>,"s1":<n>,"now":<n>,"r1":<n>,"r2":<n>},"setup":"<1-2 sentence trade setup>","risk":"<1 sentence main risk>"}`;

function useScreenWidth(){
  var [w,setW]=React.useState(function(){return typeof window!=="undefined"?window.innerWidth:390;});
  React.useEffect(function(){
    function h(){setW(window.innerWidth);}
    window.addEventListener("resize",h);
    return function(){window.removeEventListener("resize",h);};
  },[]);
  return w;
}

export default function Auxiron(){
  // Inject favicon dynamically
  useEffect(function(){
    var link=document.querySelector("link[rel~='icon']") as HTMLLinkElement||document.createElement("link");
    link.type="image/png";
    link.rel="shortcut icon";
    link.href=FAVICON_B64;
    document.head.appendChild(link);
    // PWA manifest name
    document.title="AuxiroNexus — Pro";
  },[]);
  var [tab,setTab]=useState("dashboard");
  var [navOpen,setNavOpen]=useState(false);
  var [toast,setToast]=useState<string|null>(null);
  useEffect(function(){if(toast){var t=setTimeout(function(){setToast(null);},1800);return function(){clearTimeout(t);};};},[toast]);
  var [mkt,setMkt]=useState(initMkt);
  var [sel,setSel]=useState("XAU/USD");
  var [cv,setCv]=useState("single");
  var [quad,setQuad]=useState(DEFAULT_QUAD);
  var [editQ,setEditQ]=useState(false);
  var [catF,setCatF]=useState("All");
  var [hl,setHl]=useState("");
  var [result,setResult]=useState<any>(null);
  var [loading,setLoading]=useState(false);
  var [err,setErr]=useState<string|null>(null);
  var [nowStr,setNowStr]=useState("");
  var [ctx,setCtx]=useState<any>(null);
  var [ctxLoading,setCtxLoading]=useState(false);
  var [ctxErr,setCtxErr]=useState<string|null>(null);
  var [lastRefresh,setLastRefresh]=useState<Date|null>(null);
  var [intelP1,setIntelP1]=useState<any>(null);
  var [intelP2,setIntelP2]=useState<any>(null);
  var [intelPhase,setIntelPhase]=useState<string>("idle");
  var [intelP1Progress,setIntelP1Progress]=useState(0);
  var [intelP2Progress,setIntelP2Progress]=useState(0);
  var [intelErr,setIntelErr]=useState<string|null>(null);
  var [intelSession,setIntelSession]=useState("asia");
  var [edgeImages,setEdgeImages]=useState<{name:string;base64:string;mediaType:string}[]>([]);
  var [sessionLbl,setSessionLbl]=useState(getSessionLabel());
  var cycleRef=useRef(0);
  var [intelCache,setIntelCache]=useState<{[k:string]:any}>(function(){
    try{
      var saved=localStorage.getItem("auxiron_intel_cache");
      if(saved){
        var parsed=JSON.parse(saved);
        // Restore all valid sessions — expire after 14 hours
        var valid:{[k:string]:any}={};
        var now=Date.now();
        var SESSION_WINDOWS:any={
          asia:{start:6,end:16},
          london:{start:16,end:21},
          ny:{start:21,end:30} // 30 = next day 6am
        };
        Object.keys(parsed).forEach(function(session){
          var entry=parsed[session];
          if(!entry.generatedAt)return;
          var age=(now-new Date(entry.generatedAt).getTime())/1000/3600;
          if(age<14){valid[session]=entry;}  // keep if under 14 hours old
        });
        return valid;
      }
    }catch(e){}
    return {};
  });
  var [ctxCount,setCtxCount]=useState(0);
  var [ctxSessionKey,setCtxSessionKey]=useState("");
  var [instDetail,setInstDetail]=useState<any>(null);
  var [instDetailTab,setInstDetailTab]=useState("news");
  var [instNews,setInstNews]=useState<{[k:string]:any}>({});
  var [instNewsLoading,setInstNewsLoading]=useState(false);
  var [instTf,setInstTf]=useState(1);
  var [chartTf,setChartTf]=useState(0);
  var [instNewsPhase,setInstNewsPhase]=useState<string>("idle");
  var [instNewsProgress,setInstNewsProgress]=useState(0);
  var [instNewsData,setInstNewsData]=useState<any>({});
  var [instAnalysisPhase,setInstAnalysisPhase]=useState<string>("idle");
  var [instAnalysisProgress,setInstAnalysisProgress]=useState(0);
  var [instAnalysisData,setInstAnalysisData]=useState<any>({});
  var [instCot,setInstCot]=useState<any>(null);
  var [instCotLoading,setInstCotLoading]=useState(false);
  var [instEtfFlow,setInstEtfFlow]=useState<any>(null);
  var [instEtfLoading,setInstEtfLoading]=useState(false);
  var screenW=useScreenWidth();
  var [briefData,setBriefData]=useState<any>(null);
  var [briefLoading,setBriefLoading]=useState(false);
  var [briefErr,setBriefErr]=useState<string|null>(null);

  useEffect(function(){
    var id=setInterval(function(){setNowStr(new Date().toUTCString().slice(0,25));},1000);
    setNowStr(new Date().toUTCString().slice(0,25));
    return function(){clearInterval(id);};
  },[]);

  useEffect(function(){
    var id=setInterval(function(){setSessionLbl(getSessionLabel());},60000);
    return function(){clearInterval(id);};
  },[]);



  function applyPrices(combined:any){
    if(!combined||Object.keys(combined).length===0)return;
    setMkt(function(prev){
      return prev.map(function(inst){
        var e=combined[inst.s];
        if(!e||!e.price)return inst;
        var cur=parseFloat(e.price);
        if(isNaN(cur)||cur<=0)return inst;
        var open=inst.live?inst.open:parseFloat((cur*(1+(Math.random()-0.52)*inst.v*2)).toFixed(dp(inst.b)));
        var ts=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
        var newCh=inst.ch.slice(-47).concat([{t:ts,p:parseFloat(cur.toFixed(dp(inst.b)))}]);
        return Object.assign({},inst,{cur:cur,open:open,chg:cur-open,pct:(cur-open)/open*100,ch:newCh,live:true,src:"TD"});
      });
    });
    setLastRefresh(new Date());
  }

  var fetchBatch=useCallback(function(syms:string[]){
    if(!syms||syms.length===0)return;
    var batches:string[][]=[];
    for(var i=0;i<syms.length;i+=8)batches.push(syms.slice(i,i+8));
    Promise.allSettled(batches.map(function(b){
      return fetch("/api/prices?symbol="+encodeURIComponent(b.join(","))).then(function(r){return r.json();});
    })).then(function(results){
      var combined:any={};
      results.forEach(function(r){if(r.status==="fulfilled"&&r.value&&typeof r.value==="object")Object.assign(combined,r.value);});
      applyPrices(combined);
    }).catch(function(){});
  },[]);

  var fetchChart=useCallback(function(sym:string){
    fetch("/api/prices?symbol="+encodeURIComponent(sym)+"&endpoint=timeseries&interval=30min&outputsize=48")
      .then(function(r){return r.json();})
      .then(function(d){
        if(d.status==="error"||!d.values||!d.values.length)return;
        var ch=d.values.slice().reverse().map(function(v:any){
          return{t:new Date(v.datetime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),p:parseFloat(v.close)};
        });
        var open=ch[0]&&ch[0].p;
        setMkt(function(prev){
          return prev.map(function(inst){
            if(inst.s!==sym)return inst;
            var cur=(ch[ch.length-1]&&ch[ch.length-1].p)||inst.cur;
            var o=open||inst.open;
            return Object.assign({},inst,{ch:ch,open:o,cur:cur,chg:cur-o,pct:(cur-o)/o*100,live:true,src:"TD"});
          });
        });
      }).catch(function(){});
  },[]);

  useEffect(function(){
    fetchBatch(TIER1);
    setTimeout(function(){fetchBatch(TIER2);},5000);
    var id=setInterval(function(){
      cycleRef.current++;
      fetchBatch(TIER1);
      if(cycleRef.current%12===0)fetchBatch(TIER2);
    },600000);
    return function(){clearInterval(id);};
  },[fetchBatch]);

  useEffect(function(){fetchChart(sel);},[sel,fetchChart]);

  useEffect(function(){
    var id=setInterval(function(){
      setMkt(function(prev){
        var hasNonLive=prev.some(function(i){return!i.live;});
        if(!hasNonLive)return prev;
        return prev.map(function(inst){
          if(inst.live)return inst;
          var tick=inst.v*0.08;
          var cur=parseFloat((inst.cur*(1+(Math.random()-0.492)*tick)).toFixed(dp(inst.b)));
          var newCh=inst.ch.slice(-47).concat([{t:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),p:cur}]);
          return Object.assign({},inst,{cur:cur,ch:newCh,chg:cur-inst.open,pct:(cur-inst.open)/inst.open*100});
        });
      });
    },3000);
    return function(){clearInterval(id);};
  },[]);

  function getSnap(){
    return mkt.filter(function(i){
      return["XAU/USD","WTI/USD","DX","US10Y","US02Y","VIX","SPX","NDX","EUR/USD","GBP/USD","USD/JPY"].indexOf(i.s)>=0;
    }).map(function(i){
      return i.l+": "+fmt(i.cur,i.b)+(i.cat==="Bonds"?"% yield":"")+
        " ("+(i.pct>=0?"+":"")+i.pct.toFixed(2)+"%)"+
        (i.live?"":" [SIM]");
    }).join(", ");
  }

  function handleEdgeUpload(e:React.ChangeEvent<HTMLInputElement>){
    var files=Array.from(e.target.files||[]);
    files.forEach(function(file){
      var reader=new FileReader();
      reader.onload=function(ev){
        var dataUrl=ev.target?.result as string;
        var base64=dataUrl.split(",")[1];
        var mediaType=file.type||"image/jpeg";
        setEdgeImages(function(prev){
          if(prev.length>=3)return prev;
          return prev.concat([{name:file.name,base64,mediaType}]);
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value="";
  }

  function analyze(text:string|undefined){
    var inp=(text||hl).trim();if(!inp)return;
    setLoading(true);setErr(null);setResult(null);
    var snap=getSnap();
    var userContent:any;
    if(edgeImages.length>0){
      userContent=[
        ...edgeImages.map(function(img){return{type:"image",source:{type:"base64",media_type:img.mediaType,data:img.base64}};}),
        {type:"text",text:"LIVE MARKET DATA:\n"+snap+"\n\nEVENT:\n"+inp+"\n\nEdgeFinder screenshots are attached above. Please read the COT data, Top Setups, and any positioning signals shown, then cross-analyze against the news event and fill the edgeFinderCrossCheck section in your JSON response."}
      ];
    }else{
      userContent="LIVE MARKET DATA:\n"+snap+"\n\nEVENT:\n"+inp;
    }
    callProxy(
      {model:"claude-haiku-4-5",max_tokens:3500,system:AI_SYS,messages:[{role:"user",content:userContent}]},
      function(res:any){setResult(res);setLoading(false);},
      function(e:string){setErr("Failed: "+e);setLoading(false);}
    );
  }

  function fetchCtx(){
    var today=new Date().toDateString();
    var newCount=ctxSessionKey===today?ctxCount+1:1;
    if(newCount>10){setCtxErr("Daily limit reached — max 10 briefings per day.");return;}
    setCtxCount(newCount);setCtxSessionKey(today);
    setCtxLoading(true);setCtx(null);setCtxErr(null);
    // Get precise SGT time for time-anchored search
    var nowSGT=new Date().toLocaleString("en-SG",{
      timeZone:"Asia/Singapore",
      weekday:"long",year:"numeric",month:"long",day:"numeric",
      hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false
    });
    var hourSGT=new Date(Date.now()+8*60*60*1000).getUTCHours();
    var minSGT=new Date(Date.now()+8*60*60*1000).getUTCMinutes();
    var oneHourAgo=new Date(Date.now()-60*60*1000).toLocaleString("en-SG",{
      timeZone:"Asia/Singapore",hour:"2-digit",minute:"2-digit",hour12:false
    });
    var msg="LIVE MARKET SNAPSHOT:\n"+getSnap()+"\n\nEXACT CURRENT TIME (SGT): "+nowSGT+"\n\nSEARCH WINDOW: Only news and events from "+oneHourAgo+" SGT to "+hourSGT+":"+String(minSGT).padStart(2,"0")+" SGT (last 60 minutes only).\n\nInstructions: Search specifically for what has happened in the last 60 minutes from the timestamp above. Report only genuinely new developments not ongoing background context. If Iran/geopolitical situation is ongoing but nothing NEW happened in the last hour, say so explicitly and provide current price levels instead.\n\nWhat specific events, data prints, speeches, or price moves occurred between "+oneHourAgo+" SGT and now?";
    callProxy(
      {model:"claude-haiku-4-5",max_tokens:3000,system:CTX_SYS,
       messages:[{role:"user",content:msg}],
       useWebSearch:true},
      function(res:any){setCtx(res);setLastRefresh(new Date());setCtxLoading(false);setCtxErr(null);},
      function(e:string){setCtxErr("Failed: "+e);setCtxLoading(false);}
    );
  }
    
  

  async function fetchInstNews(m:any,force?:boolean){
    var sym=m.s;
    if(!force&&instNews[sym]){
      setInstNewsData(instNews[sym]);setInstNewsPhase("done");setInstNewsProgress(100);return;
    }
    if(!canSpend()){setInstNewsPhase("done");return;}
    setInstNewsPhase("loading");setInstNewsProgress(2);setInstNewsData({});
    try{
      var acc=await _streamPhase("/api/stream",
        {model:"claude-haiku-4-5",max_tokens:1200,system:INST_NEWS_SYS_STREAM,
         messages:[{role:"user",content:"News brief for "+m.l+" ("+sym+"). Price: "+m.cur.toFixed(2)+" ("+(m.pct>=0?"+":"")+m.pct.toFixed(2)+"%). May 2026."}],
         useWebSearch:false},
        function(t:string){
          setInstNewsProgress(Math.min(90,(t.length/1000)*100));
          var d:any={};
          var b=_exStr(t,"brief");if(b)d.brief=b;
          var it=_exBkt(t,"items","[");if(it)d.items=it;
          var kl=_exBkt(t,"keyLevel","{");if(kl)d.keyLevel=kl;
          setInstNewsData(d);
        }
      );
      var fin:any=null;
      try{var si=acc.indexOf("{"),ei=acc.lastIndexOf("}");if(si!==-1&&ei>si)fin=JSON.parse(acc.slice(si,ei+1));}catch(ex){}
      if(!fin){fin={};var b2=_exStr(acc,"brief");if(b2)fin.brief=b2;var it2=_exBkt(acc,"items","[");if(it2)fin.items=it2;var kl2=_exBkt(acc,"keyLevel","{");if(kl2)fin.keyLevel=kl2;}
      setInstNewsData(fin);setInstNewsProgress(100);setInstNewsPhase("done");
      setInstNews(function(p:any){var n={...p};n[sym]=fin;return n;});
      recordSpend("news_tagging","claude-haiku-4-5",700,1200);
    }catch(e:any){setInstNewsPhase("idle");}
  }

  async function fetchInstAnalysis(m:any){
    if(!canSpend()){setInstAnalysisPhase("idle");return;}
    setInstAnalysisPhase("loading");setInstAnalysisProgress(2);setInstAnalysisData({});
    try{
      var acc=await _streamPhase("/api/stream",
        {model:"claude-sonnet-4-6",max_tokens:1500,system:INST_ANAL_SYS,
         messages:[{role:"user",content:"Analysis for "+m.l+" ("+m.s+"). Price: "+m.cur.toFixed(2)+" ("+(m.pct>=0?"+":"")+m.pct.toFixed(2)+"%). May 2026."}],
         useWebSearch:false},
        function(t:string){
          setInstAnalysisProgress(Math.min(90,(t.length/1200)*100));
          var d:any={};
          ["bias","biasColor","summary","setup","risk"].forEach(function(f:string){var v=_exStr(t,f);if(v)d[f]=v;});
          var drv=_exBkt(t,"drivers","[");if(drv)d.drivers=drv;
          var lv=_exBkt(t,"levels","{");if(lv)d.levels=lv;
          setInstAnalysisData(d);
        }
      );
      var fin:any=null;
      try{var si2=acc.indexOf("{"),ei2=acc.lastIndexOf("}");if(si2!==-1&&ei2>si2)fin=JSON.parse(acc.slice(si2,ei2+1));}catch(ex){}
      if(!fin){fin={};["bias","biasColor","summary","setup","risk"].forEach(function(f:string){var v=_exStr(acc,f);if(v)fin[f]=v;});var drv2=_exBkt(acc,"drivers","[");if(drv2)fin.drivers=drv2;var lv2=_exBkt(acc,"levels","{");if(lv2)fin.levels=lv2;}
      setInstAnalysisData(fin);setInstAnalysisProgress(100);setInstAnalysisPhase("done");
      recordSpend("expanded_chart_summary","claude-sonnet-4-6",1000,1500);
    }catch(e:any){setInstAnalysisPhase("idle");}
  }

  async function fetchInstCot(sym:string){
    setInstCotLoading(true);setInstCot(null);
    try{
      var r=await fetch("/api/cot?symbol="+encodeURIComponent(sym));
      var d=await r.json();
      if(!d.error)setInstCot(d);
    }catch(e){}
    setInstCotLoading(false);
  }

  var INST_ETF_MAP:Record<string,string>={
    "XAU/USD":"GLD","XAG/USD":"SLV","SPX":"SPY","NDX":"QQQ","DJI":"DIA",
    "DX":"UUP","WTI/USD":"USO","US10Y":"TLT","US02Y":"SHY","US30Y":"TLT",
    "BTC/USD":"IBIT","ETH/USD":"ETHA","BRENT":"BNO","VIX":"VXX",
    "DAX":"EWG","FTSE":"EWU","NI225":"EWJ",
  };

  async function fetchInstEtfFlow(sym:string){
    var etfSym=INST_ETF_MAP[sym];
    if(!etfSym){setInstEtfFlow(null);return;}
    setInstEtfLoading(true);
    try{
      var r=await fetch("/api/prices?symbol="+encodeURIComponent(etfSym)+"&endpoint=timeseries&interval=1day&outputsize=2");
      var d=await r.json();
      if(d.values&&d.values.length>=2){
        var cur2=parseFloat(d.values[0].close);
        var prev2=parseFloat(d.values[1].close);
        var vol2=parseInt(d.values[0].volume||0);
        setInstEtfFlow({sym:etfSym,price:cur2,pct:((cur2-prev2)/prev2)*100,vol:vol2});
      }else if(d.values&&d.values.length===1){
        setInstEtfFlow({sym:etfSym,price:parseFloat(d.values[0].close),pct:0,vol:0});
      }
    }catch(e){}
    setInstEtfLoading(false);
  }

  function openInstDetail(m:any){
    setInstDetail(m);setInstDetailTab("news");setInstTf(2);
    setInstNewsPhase("idle");setInstNewsData({});setInstNewsProgress(0);
    setInstAnalysisPhase("idle");setInstAnalysisData({});setInstAnalysisProgress(0);
    setInstCot(null);setInstCotLoading(false);
    setInstEtfFlow(null);setInstEtfLoading(false);
    setTimeout(function(){
      fetchInstNews(m);
      fetchInstCot(m.s);
      fetchInstEtfFlow(m.s);
    },30);
  }

  function closeInstDetail(){setInstDetail(null);}

  function _exStr(text:string,field:string):string|null{
    var pat=new RegExp('"'+field+'"\\s*:\\s*"((?:[^"\\\\]|\\\\[\\s\\S])*?)"');
    var m=text.match(pat);
    if(!m)return null;
    return m[1].replace(/\\n/g,"\n").replace(/\\"/g,'"').replace(/\\'/g,"'");
  }
  function _exBkt(text:string,field:string,open:string):any{
    var pat=new RegExp('"'+field+'"\\s*:\\s*\\'+open);
    var sm=text.match(pat);
    if(!sm)return null;
    var si=sm.index!+sm[0].length-1;
    var depth=0,inStr=false,esc=false;
    for(var i=si;i<text.length;i++){
      var ch=text[i];
      if(esc){esc=false;continue;}if(ch==="\\"&&inStr){esc=true;continue;}
      if(ch==='"'){inStr=!inStr;continue;}if(inStr)continue;
      if(ch==="["||ch==="{")depth++;
      if(ch==="]"||ch==="}"){depth--;if(depth===0){try{return JSON.parse(text.slice(si,i+1));}catch(ex){return null;}}}
    }
    return null;
  }
  function _parseP1(text:string):any{
    var d:any={};
    ["session","generatedAt","validFor","marketRegime","regimeDrivers","headline","executiveSummary"].forEach(function(f){var v=_exStr(text,f);if(v)d[f]=v;});
    ["alerts","calendar"].forEach(function(f){var v=_exBkt(text,f,"[");if(v)d[f]=v;});
    ["overnightRecap","vixSnapshot"].forEach(function(f){var v=_exBkt(text,f,"{");if(v)d[f]=v;});
    return d;
  }
  function _parseP2(text:string):any{
    var d:any={};
    ["tradeFocus"].forEach(function(f){var v=_exStr(text,f);if(v)d[f]=v;});
    ["instruments","watchlist","macro"].forEach(function(f){var v=_exBkt(text,f,"[");if(v)d[f]=v;});
    ["inflationRisk","centralBanks","positionManagement","liquidityAssessment"].forEach(function(f){var v=_exBkt(text,f,"{");if(v)d[f]=v;});
    return d;
  }
  async function _streamPhase(url:string,body:any,onChunk:(t:string)=>void):Promise<string>{
    var res=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    if(!res.ok)throw new Error("HTTP "+res.status);
    var reader=res.body!.getReader();
    var decoder=new TextDecoder();
    var accumulated="";
    while(true){
      var r=await reader.read();
      if(r.done)break;
      var lines=decoder.decode(r.value,{stream:true}).split("\n");
      for(var li=0;li<lines.length;li++){
        if(!lines[li].startsWith("data: "))continue;
        var raw=lines[li].slice(6).trim();
        if(raw==="[DONE]")continue;
        try{
          var evt=JSON.parse(raw);
          if(evt.type==="content_block_delta"&&evt.delta&&evt.delta.type==="text_delta"){
            accumulated+=evt.delta.text;
            onChunk(accumulated);
          }
        }catch(ex){}
      }
    }
    return accumulated;
  }

  function isValidP1(p:any){return !!(p&&(p.headline||p.executiveSummary||p.marketRegime));}
  function isValidP2(p:any){return !!(p&&Object.keys(p).length>2);}

  async function fetchIntel(session:string,force?:boolean){
    if(!force&&intelCache[session]){
      var cached=intelCache[session];
      if(isValidP1(cached.p1)){
        setIntelP1(cached.p1);
        setIntelP2(cached.p2||null);
        setIntelPhase("complete");
        return;
      } else {
        // Cache exists but is empty/corrupted — delete it and regenerate
        setIntelCache(function(prev:any){
          var n={...prev};delete n[session];
          try{var s=JSON.parse(localStorage.getItem("auxiron_intel_cache")||"{}");delete s[session];localStorage.setItem("auxiron_intel_cache",JSON.stringify(s));}catch(ex){}
          return n;
        });
      }
    }
    if(!isSessionActive(session)&&!force){
      var unlockTime=getSessionUnlockSGT(session);
      setIntelErr("🔒 "+getSessionLabel2(session)+" hasn't started yet. Unlocks at "+unlockTime+". Tap to view your previous report if one was saved.");
      setIntelPhase("idle");
      return;
    }
    setIntelPhase("p1loading");
    setIntelP1(null);setIntelP2(null);setIntelErr(null);
    setIntelP1Progress(2);setIntelP2Progress(0);
    var wakeLock:any=null;
    if("wakeLock" in navigator){try{wakeLock=await (navigator as any).wakeLock.request("screen");}catch(ex){}}
    function releaseWakeLock(){if(wakeLock)wakeLock.release().catch(function(){});}
    var SESSIONS_MAP:any={
      asia:"ASIA OPEN (SGT 6am-3pm) — Sydney/Tokyo sessions",
      london:"LONDON OPEN (SGT 4pm-1am) — European session, FX focus",
      ny:"NY SESSION (SGT 9pm-6am) — London/NY overlap, Fed speakers, US data"
    };
    var label=SESSIONS_MAP[session]||"NY SESSION";
    var snap=getSnap();
    var now=new Date().toLocaleString("en-SG",{timeZone:"Asia/Singapore"});
    var p1msg="LIVE MARKET DATA:\n"+snap+"\n\nSESSION: "+label+"\n\nCurrent SGT time: "+now+"\n\nGenerate Phase 1 situational awareness briefing. Search for latest headlines, overnight moves, VIX, economic calendar for tonight.";
    try{
      var acc1=await _streamPhase("/api/stream",
        {model:"claude-haiku-4-5",max_tokens:3000,system:INTEL_P1_SYS,messages:[{role:"user",content:p1msg}],useWebSearch:true},
        function(t:string){setIntelP1Progress(Math.min(90,(t.length/3000)*100));setIntelP1(_parseP1(t));}
      );
      var p1:any=null;
      try{var si1=acc1.indexOf("{"),ei1=acc1.lastIndexOf("}");if(si1!==-1&&ei1>si1)p1=JSON.parse(acc1.slice(si1,ei1+1));}catch(ex){}
      p1=p1||_parseP1(acc1);
      setIntelP1(p1);setIntelP1Progress(100);
      setIntelPhase("p2loading");setIntelP2Progress(2);
      var p1summary="Session: "+label+"\nRegime: "+(p1.marketRegime||"UNKNOWN")+"\nHeadline: "+(p1.headline||"")+"\nAlerts: "+(p1.alerts?p1.alerts.map(function(a:any){return a.type+": "+a.headline;}).join("; "):"none")+"\nVIX: "+(p1.vixSnapshot?p1.vixSnapshot.level+" "+p1.vixSnapshot.label:"unknown");
      var p2msg="LIVE MARKET DATA:\n"+snap+"\n\nSESSION: "+label+"\n\nPHASE 1 SUMMARY:\n"+p1summary+"\n\nGenerate Phase 2 deep analysis: inflation risk, central banks, macro framework, liquidity assessment, position management, instruments with key levels, watchlist, trade focus. Use your knowledge of current macro conditions — no web search needed.";
      var acc2=await _streamPhase("/api/stream",
        {model:"claude-sonnet-4-6",max_tokens:5000,system:INTEL_P2_SYS,messages:[{role:"user",content:p2msg}],useWebSearch:false},
        function(t:string){setIntelP2Progress(Math.min(90,(t.length/5000)*100));setIntelP2(_parseP2(t));}
      );
      var p2:any=null;
      try{var si2=acc2.indexOf("{"),ei2=acc2.lastIndexOf("}");if(si2!==-1&&ei2>si2)p2=JSON.parse(acc2.slice(si2,ei2+1));}catch(ex){}
      p2=p2||_parseP2(acc2);
      setIntelP2(p2);setIntelP2Progress(100);
      setIntelPhase("complete");
      releaseWakeLock();
      // Only cache if p1 has real content — never save empty reports
      if(p1&&(p1.headline||p1.executiveSummary||p1.marketRegime)){
        setIntelCache(function(prev:any){
          var n={...prev};n[session]={p1,p2};
          try{
            var toSave:any={};
            Object.keys(n).forEach(function(k){toSave[k]={p1:n[k].p1,p2:n[k].p2,generatedAt:new Date().toISOString()};});
            localStorage.setItem("auxiron_intel_cache",JSON.stringify(toSave));
          }catch(ex){}
          return n;
        });
      } else {
        setIntelErr("⚠ Report generated but content was empty. Please try again.");
        setIntelPhase("idle");
      }
    }catch(e:any){
      if((e as any).name!=="AbortError"){setIntelErr("Failed: "+(e as any).message);setIntelPhase("idle");}
      releaseWakeLock();
    }
  }

  function toggleQuad(sym:string){
    setQuad(function(prev){
      if(prev.indexOf(sym)>=0)return prev.length>1?prev.filter(function(s){return s!==sym;}):prev;
      if(prev.length>=4)return prev.slice(1).concat([sym]);
      return prev.concat([sym]);
    });
  }

  // ── DERIVED VARS ──────────────────────────────────────
  var cfg=result?(ICFG[result.impactLevel as keyof typeof ICFG]||ICFG.NOISE):null;
  var selI=mkt.find(function(d){return d.s===sel;});
  var vixI=mkt.find(function(d){return d.s==="VIX";});
  var dxyI=mkt.find(function(d){return d.s==="DX";});
  var goldI=mkt.find(function(d){return d.s==="XAU/USD";});
  var y2=mkt.find(function(d){return d.s==="US02Y";});
  var y10=mkt.find(function(d){return d.s==="US10Y";});
  var spread=y2&&y10?parseFloat((y10.cur-y2.cur).toFixed(3)):null;
  var inverted=spread!==null&&spread<0;
  var anyLive=mkt.some(function(m){return m.live;});
  var stClr=anyLive?C.goldL:C.amber;
  var roro_score=calcROROScore(mkt);
  var roro=getROROLabel(roro_score);
  var goldBias=calcGoldBias(mkt);
  var goldBiasColor=goldBias==="BULLISH"?C.up:goldBias==="BEARISH"?C.dn:C.amber;
  var inflationRisk=calcInflationRisk(mkt);

  var displayed=catF==="All"?mkt.filter(function(m){return m.tier<=2;}):
    catF==="Risk-On"?mkt.filter(function(m){return m.roro==="ON";}):
    catF==="Risk-Off"?mkt.filter(function(m){return m.roro==="OFF";}):
    catF==="FX"?mkt.filter(function(m){return m.cat==="Forex";}):
    catF==="Bonds"?mkt.filter(function(m){return m.cat==="Bonds";}):
    mkt.filter(function(m){return m.tier<=2;});

  const NAV=[
    {key:"markets",label:"Markets",accent:C.goldL,
     icon:function(active:boolean){return(<svg width="20" height="20" viewBox="0 0 18 18" fill="none">
       <rect x="2.5" y="6" width="3" height="8" rx="1" fill={active?"#f0cc5a":"#3a5570"}/>
       <line x1="4" y1="3" x2="4" y2="6" stroke={active?"#f0cc5a":"#3a5570"} strokeWidth="1.5" strokeLinecap="round"/>
       <line x1="4" y1="14" x2="4" y2="16" stroke={active?"#f0cc5a":"#3a5570"} strokeWidth="1.5" strokeLinecap="round"/>
       <rect x="7" y="4" width="3" height="6" rx="1" fill={active?"#22d46e":"#1a3828"}/>
       <line x1="8.5" y1="2" x2="8.5" y2="4" stroke={active?"#22d46e":"#1a3828"} strokeWidth="1.5" strokeLinecap="round"/>
       <line x1="8.5" y1="10" x2="8.5" y2="12" stroke={active?"#22d46e":"#1a3828"} strokeWidth="1.5" strokeLinecap="round"/>
       <rect x="11.5" y="7" width="3" height="7" rx="1" fill={active?"#f04545":"#3a1010"}/>
       <line x1="13" y1="4.5" x2="13" y2="7" stroke={active?"#f04545":"#3a1010"} strokeWidth="1.5" strokeLinecap="round"/>
       <line x1="13" y1="14" x2="13" y2="16" stroke={active?"#f04545":"#3a1010"} strokeWidth="1.5" strokeLinecap="round"/>
     </svg>);}},
    
    {key:"session",label:"Session",accent:C.bond,
     icon:function(active:boolean){return(<svg width="20" height="20" viewBox="0 0 18 18" fill="none">
       <circle cx="9" cy="9" r="6.5" stroke={active?C.bond:"#3a5570"} strokeWidth="1.5" fill="none"/>
       <line x1="9" y1="4.5" x2="9" y2="9" stroke={active?C.bond:"#3a5570"} strokeWidth="1.8" strokeLinecap="round"/>
       <line x1="9" y1="9" x2="12.2" y2="11.2" stroke={active?"#f0a020":"#3a5570"} strokeWidth="1.8" strokeLinecap="round"/>
       <circle cx="9" cy="9" r="1.2" fill={active?C.bond:"#3a5570"}/>
     </svg>);}},
    {key:"intel",label:"Intel",accent:C.gold,
     icon:function(active:boolean){return(<svg width="20" height="20" viewBox="0 0 18 18" fill="none">
       <path d="M9 2L10.8 6.5H15.8L11.8 9.4L13.3 14.2L9 11.3L4.7 14.2L6.2 9.4L2.2 6.5H7.2L9 2Z"
         stroke={active?C.gold:"#3a5570"} strokeWidth="1.4" strokeLinejoin="round"
         fill={active?"rgba(212,168,67,0.15)":"none"}/>
     </svg>);}},
    {key:"filter",label:"Filter",accent:C.vix,
     icon:function(active:boolean){return(<svg width="20" height="20" viewBox="0 0 18 18" fill="none">
       <path d="M2.5 4H15.5L11 9.5V14.5L7 12.5V9.5L2.5 4Z"
         stroke={active?C.vix:"#3a5570"} strokeWidth="1.4" strokeLinejoin="round"
         fill={active?"rgba(176,96,240,0.15)":"none"}/>
       <circle cx="13.5" cy="13.5" r="2.8" fill={active?C.vix:"none"} stroke={active?"none":"#3a5570"} strokeWidth="1.2"/>
       {active&&<path d="M12.3 13.5L13.2 14.4L14.8 12.6" stroke="#080e14" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>}
     </svg>);}},
  ];

  var GNAV=[
    {key:"dashboard",label:"Home",
     icon:function(c:string){return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>);}},
    {key:"markets",label:"Markets",
     icon:function(c:string){return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>);}},
    {key:"axrisk",label:"AX Risk",disabled:true,
     icon:function(c:string){return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z"/></svg>);}},
    {key:"journal",label:"Journal",disabled:true,
     icon:function(c:string){return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="15" y2="7"/><line x1="8" y1="11" x2="15" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/></svg>);}},
    {key:"more",label:"More",
     icon:function(c:string){return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>);}},
  ];

  return(
    <div style={{fontFamily:"'IBM Plex Sans',sans-serif",color:C.txt0}} className="auxiron-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{width:100%;height:100%;overflow-x:hidden;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#1e2d40;border-radius:2px;}
        textarea:focus{outline:none;}
        button{-webkit-tap-highlight-color:transparent;cursor:pointer;font-family:inherit;}
        .tap:active{opacity:0.7;}
        @keyframes fu{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}} .fu{animation:fu 0.28s ease forwards;} @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes pd{0%,100%{opacity:1}50%{opacity:0.1}} .pd{animation:pd 1.5s ease infinite;}
        @keyframes sp{to{transform:rotate(360deg)}} .sp{animation:sp 0.8s linear infinite;} @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes tk{0%{transform:translateX(0)}100%{transform:translateX(-50%)}} .tk{animation:tk 65s linear infinite;display:inline-block;white-space:nowrap;} .tk:hover{animation-play-state:paused;}
        .auxiron-root{display:flex;width:100%;min-height:100vh;min-height:100dvh;background:#080e14;font-family:'IBM Plex Sans',sans-serif;}
        .auxiron-main{flex:1;display:flex;flex-direction:column;width:100%;min-width:0;}
        .auxiron-content{flex:1;overflow-y:auto;overflow-x:hidden;padding-bottom:env(safe-area-inset-bottom,0px);-webkit-overflow-scrolling:touch;}
        .auxiron-inner{width:100%;padding:0;}
        @media(max-width:480px){.auxiron-inner{font-size:13px;}}
      `}</style>

      {/* HAMBURGER SIDE NAV OVERLAY */}
      {navOpen&&<div style={{position:"fixed",inset:0,zIndex:500,display:"flex"}} onClick={function(){setNavOpen(false);}}>
        <div style={{width:280,height:"100%",background:"#0d1320",borderRight:"1px solid #1e2e42",display:"flex",flexDirection:"column",overflowY:"auto",animation:"slideUp .2s ease",flexShrink:0}} onClick={function(e){e.stopPropagation();}}>
          {/* Nav header */}
          <div style={{padding:"16px 14px",borderBottom:"1px solid #1e2e42",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"#ffffff"}}>AUXIRO</span>
              <span style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"#e8d5a3"}}>NEXUS</span>
              <span style={{fontSize:7,background:"rgba(74,158,255,0.12)",color:"#4a9eff",padding:"2px 5px",borderRadius:3,letterSpacing:".1em",border:"1px solid rgba(74,158,255,0.25)"}}>PRO</span>
            </div>
            <button onClick={function(){setNavOpen(false);}} style={{background:"none",border:"none",cursor:"pointer",padding:4,color:"rgba(255,255,255,0.4)",fontSize:18,lineHeight:1}}>✕</button>
          </div>
          {/* Nav items */}
          <div style={{flex:1,padding:"10px 10px"}}>
            {/* MAIN */}
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 6px 4px"}}>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,fontWeight:700,color:"#e8d5a3",letterSpacing:".12em"}}>MAIN</span>
              <div style={{flex:1,height:1,background:"rgba(232,213,163,0.15)"}}/>
            </div>
            {[{key:"dashboard",label:"Dashboard"}].map(function(item){
              var active=tab===item.key;
              return <button key={item.key} className="tap" onClick={function(){setTab(item.key);setNavOpen(false);}}
                style={{display:"flex",alignItems:"center",gap:10,width:"100%",background:active?"rgba(232,213,163,0.08)":"transparent",border:"none",borderLeft:active?"3px solid #e8d5a3":"3px solid transparent",borderRadius:"0 8px 8px 0",padding:"9px 12px",marginBottom:2,textAlign:"left",cursor:"pointer"}}>
                <span style={{fontSize:13,fontWeight:active?700:400,color:"#ffffff",letterSpacing:".01em"}}>{item.label}</span>
              </button>;
            })}
            {/* INTELLIGENCE */}
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 6px 4px"}}>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,fontWeight:700,color:"#4a9eff",letterSpacing:".12em"}}>INTELLIGENCE</span>
              <div style={{flex:1,height:1,background:"rgba(74,158,255,0.2)"}}/>
            </div>
            {[{key:"intel",label:"Auxiron Brief"},{key:"session",label:"Scenario Desk"},{key:"news",label:"News Feed"},{key:"filter",label:"News Filter"},{key:"calendar",label:"Economic Calendar"}].map(function(item){
              var active=tab===item.key;
              return <button key={item.key} className="tap" onClick={function(){setTab(item.key);setNavOpen(false);}}
                style={{display:"flex",alignItems:"center",gap:10,width:"100%",background:active?"rgba(74,158,255,0.08)":"transparent",border:"none",borderLeft:active?"3px solid #4a9eff":"3px solid transparent",borderRadius:"0 8px 8px 0",padding:"9px 12px",marginBottom:2,textAlign:"left",cursor:"pointer"}}>
                <span style={{fontSize:13,fontWeight:active?700:400,color:"#ffffff"}}>{item.label}</span>
              </button>;
            })}
            {/* TRADING TOOLS */}
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 6px 4px"}}>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,fontWeight:700,color:"#1d9e75",letterSpacing:".12em"}}>TRADING TOOLS</span>
              <div style={{flex:1,height:1,background:"rgba(29,158,117,0.2)"}}/>
            </div>
            {[{key:"axrisk",label:"AX Risk"},{key:"journal",label:"Trade Journal"},{key:"playbook",label:"Playbook AX"}].map(function(item){
              return <button key={item.key} className="tap" onClick={function(){setTab(item.key);setNavOpen(false);}}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:"transparent",border:"none",borderLeft:"3px solid transparent",borderRadius:"0 8px 8px 0",padding:"9px 12px",marginBottom:2,textAlign:"left",cursor:"pointer"}}>
                <span style={{fontSize:13,color:"#ffffff"}}>{item.label}</span>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7,color:"#4a9eff",background:"rgba(74,158,255,0.14)",padding:"1px 5px",borderRadius:3}}>NEW</span>
              </button>;
            })}
            {/* MARKETS */}
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 6px 4px"}}>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,fontWeight:700,color:"#9b77e8",letterSpacing:".12em"}}>MARKETS</span>
              <div style={{flex:1,height:1,background:"rgba(155,119,232,0.2)"}}/>
            </div>
            {[{key:"markets",label:"Markets Overview"},{key:"cot",label:"COT Data"}].map(function(item){
              var active=tab===item.key;
              return <button key={item.key} className="tap" onClick={function(){setTab(item.key);setNavOpen(false);}}
                style={{display:"flex",alignItems:"center",gap:10,width:"100%",background:active?"rgba(155,119,232,0.08)":"transparent",border:"none",borderLeft:active?"3px solid #9b77e8":"3px solid transparent",borderRadius:"0 8px 8px 0",padding:"9px 12px",marginBottom:2,textAlign:"left",cursor:"pointer"}}>
                <span style={{fontSize:13,fontWeight:active?700:400,color:"#ffffff"}}>{item.label}</span>
              </button>;
            })}
            {/* ACCOUNT */}
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 6px 4px"}}>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,fontWeight:700,color:"#7a9ab8",letterSpacing:".12em"}}>ACCOUNT</span>
              <div style={{flex:1,height:1,background:"rgba(122,154,184,0.2)"}}/>
            </div>
            {["Profile","Settings","Help"].map(function(lbl){
              return <button key={lbl} className="tap"
                style={{display:"flex",alignItems:"center",gap:10,width:"100%",background:"transparent",border:"none",borderLeft:"3px solid transparent",borderRadius:"0 8px 8px 0",padding:"9px 12px",marginBottom:2,textAlign:"left",cursor:"pointer"}}>
                <span style={{fontSize:13,color:"#ffffff"}}>{lbl}</span>
              </button>;
            })}
          </div>
          {/* Footer */}
          <div style={{padding:"12px 14px",borderTop:"1px solid #1e2e42",fontSize:9,color:"#2a3a4a",letterSpacing:".06em",fontFamily:"'IBM Plex Mono',monospace"}}>AuxiroNexus v2.0 · Pro plan</div>
        </div>
        <div style={{flex:1,background:"rgba(0,0,0,0.55)"}}/>
      </div>}

      {/* MAIN CONTENT AREA */}
      <div className="auxiron-main" style={{display:"flex",flexDirection:"column"}}>

      {/* HEADER */}
      <div style={{background:C.bg1,borderBottom:"1px solid "+C.border,padding:"10px 14px",flexShrink:0}}>
        {/* Top row */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={function(){setNavOpen(true);}} style={{background:"none",border:"none",padding:"4px 2px",cursor:"pointer",display:"flex",flexDirection:"column",gap:4,justifyContent:"center",flexShrink:0,WebkitTapHighlightColor:"transparent"}}>
              <span style={{display:"block",width:20,height:2,background:"#ffffff",borderRadius:1}}/>
              <span style={{display:"block",width:20,height:2,background:"#ffffff",borderRadius:1}}/>
              <span style={{display:"block",width:20,height:2,background:"#ffffff",borderRadius:1}}/>
            </button>
            <div style={{width:7,height:7,borderRadius:"50%",background:stClr,boxShadow:"0 0 8px "+stClr}} className="pd"/>
            <img src="/logo-192.png" alt="AuxiroNexus" style={{height:28,width:28,borderRadius:6,objectFit:"cover",flexShrink:0}}/>
            <div style={{display:"flex",alignItems:"baseline",gap:0}}>
              <span style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,letterSpacing:"-.01em",color:C.txt0}}>Auxiro</span>
              <span style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,letterSpacing:"-.01em",color:C.gold}}>Nexus</span>
            </div>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,background:"rgba(212,168,67,0.12)",color:C.goldL,padding:"2px 6px",borderRadius:3,letterSpacing:".1em",border:"1px solid rgba(212,168,67,0.25)"}}>PRO</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            {/* Session — icon + short abbrev */}
            <div style={{background:sessionLbl.color+"0d",border:"1px solid "+sessionLbl.color+"30",borderRadius:4,padding:"2px 6px",display:"flex",alignItems:"center",gap:3}}>
              <span style={{fontSize:9}}>{sessionLbl.label.includes("NY")?"🗽":sessionLbl.label.includes("LONDON")||sessionLbl.label.includes("LDN")?"🌍":"🌏"}</span>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7,color:sessionLbl.color,fontWeight:700,letterSpacing:".04em"}}>{sessionLbl.label.replace("ASIA/TOKYO","ASIA").replace("LDN/NY OVERLAP","LDN/NY").replace("NY SESSION","NY").replace("LONDON","LDN").replace("SYDNEY","SYD").replace("OFF-HOURS","OFF")}</span>
            </div>
            {/* Risk — coloured dot + R-OFF/R-ON */}
            <div style={{background:roro.color+"0d",border:"1px solid "+roro.color+"30",borderRadius:4,padding:"2px 6px",display:"flex",alignItems:"center",gap:3}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:roro.color,flexShrink:0}}/>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7,color:roro.color,fontWeight:700}}>{roro.label==="RISK-ON"?"R-ON":roro.label==="RISK-OFF"?"R-OFF":"MIX"}</span>
            </div>
            {/* Live dot only */}
            <div style={{width:6,height:6,borderRadius:"50%",background:stClr,boxShadow:"0 0 5px "+stClr}}/>
          </div>
        </div>
        {/* RORO score bar */}
        <div style={{marginBottom:6}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
            <span style={{fontSize:7,color:"#f04040"}}>RISK-OFF</span>
            <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:8,color:C.txt3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:160}}>{roro.desc.split(" · ").slice(0,2).join(" · ")}</span>
            <span style={{fontSize:7,color:"#28cc78"}}>RISK-ON</span>
          </div>
          <div style={{height:4,background:C.bg2,borderRadius:2,overflow:"hidden",position:"relative"}}>
            <div style={{position:"absolute",left:0,width:"50%",height:"100%",background:"rgba(240,64,64,0.3)"}}/>
            <div style={{position:"absolute",right:0,width:"50%",height:"100%",background:"rgba(40,204,120,0.3)"}}/>
            <div style={{position:"absolute",left:roro_score+"%",transform:"translateX(-50%)",
              width:8,height:8,borderRadius:"50%",background:roro.color,top:-2,
              boxShadow:"0 0 6px "+roro.color}}/>
          </div>
        </div>
        {/* Budget bar */}
        {(function(){var bs=getBudgetStatus();var bc=bs.percentage<40?"#00d084":bs.percentage<80?"#e8d5a3":"#ff4d4d";return <div style={{marginBottom:6}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7,color:"#3a5570",letterSpacing:".08em"}}>AI BUDGET</span>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7,color:bc}}>${bs.spent.toFixed(3)} / $0.50</span>
          </div>
          <div style={{height:2,background:"#121d2c",borderRadius:1,overflow:"hidden"}}>
            <div style={{height:"100%",width:bs.percentage+"%",background:bc,transition:"width .5s ease",borderRadius:1}}/>
          </div>
        </div>;}())}
        {/* Quick stats */}
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {goldI&&<div style={{background:C.bg2,border:"1px solid rgba(200,168,64,0.2)",borderRadius:6,padding:"3px 7px",display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:8,color:C.gold}}>AU</span>
            <span style={{fontSize:10,fontWeight:600,color:goldI.pct>=0?C.up:C.dn,fontVariantNumeric:"tabular-nums"}}>{fmt(goldI.cur,goldI.b)}</span>
            <span style={{fontSize:8,fontWeight:700,color:goldBiasColor}}>{goldBias}</span>
          </div>}
          {vixI&&<div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:6,padding:"3px 7px",display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:8,color:C.txt2}}>VIX</span>
            <span style={{fontSize:10,fontWeight:600,color:vixClr(vixI.cur)}}>{vixI.cur.toFixed(2)}</span>
            <span style={{fontSize:7,color:C.txt3}}>{vixLbl(vixI.cur)}</span>
          </div>}
          {dxyI&&<div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:6,padding:"3px 7px",display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:8,color:C.txt2}}>DXY</span>
            <span style={{fontSize:10,fontWeight:600,color:dxyI.pct>=0?C.dn:C.up}}>{dxyI.cur.toFixed(2)}</span>
          </div>}
          {spread!==null&&<div style={{background:C.bg2,border:"1px solid "+(inverted?C.dn:C.up)+"44",borderRadius:6,padding:"3px 7px",display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:8,color:C.txt2}}>2s10s</span>
            <span style={{fontSize:10,fontWeight:600,color:inverted?C.dn:C.up}}>{spread>0?"+":""}{spread}%</span>
            <span style={{fontSize:7,color:inverted?C.dn:C.up}}>{inverted?"INV":"NRM"}</span>
          </div>}
        </div>
      </div>

      {/* TICKER */}
      <div style={{background:C.bg1,borderBottom:"1px solid "+C.border,overflow:"hidden",height:26,display:"flex",alignItems:"center",flexShrink:0}}>
        <div className="tk">
          {mkt.filter(function(m){return m.tier<=2;}).concat(mkt.filter(function(m){return m.tier<=2;})).map(function(m,i){
            var up=m.pct>=0;
            return <span key={i} style={{display:"inline-flex",alignItems:"center",gap:5,marginRight:18}}>
              <span style={{fontSize:9,color:C.txt2}}>{m.l}</span>
              <span style={{fontSize:10,fontWeight:500,color:C.txt1,fontVariantNumeric:"tabular-nums"}}>{fmt(m.cur,m.b)}</span>
              <span style={{fontSize:9,color:up?C.up:C.dn}}>{up?"+":""}{m.pct.toFixed(2)}%</span>
            </span>;
          })}
        </div>
      </div>

      <div className="auxiron-content">
        <div className="auxiron-inner">

        {/* ── DASHBOARD ── */}
        {tab==="dashboard"&&<Dashboard mkt={mkt} sessionLbl={sessionLbl} roro={roro} roro_score={roro_score} stClr={stClr} tab={tab} setTab={setTab} onOpenNav={function(){setNavOpen(true);}}/>}

        {/* ── MARKETS ── */}
        {tab==="markets"&&<div>
          {/* Category filter */}
          <div style={{padding:"8px 12px",display:"flex",gap:5,overflowX:"auto",borderBottom:"1px solid "+C.border}}>
            {FILTER_CATS.map(function(c){
              var a=catF===c;
              return <button key={c} className="tap" onClick={function(){setCatF(c);}}
                style={{background:a?"rgba(200,168,64,0.12)":C.bg2,border:a?"1px solid rgba(200,168,64,0.38)":"1px solid "+C.border,
                  color:a?C.goldL:C.txt2,borderRadius:20,padding:"4px 11px",fontSize:9,fontWeight:500,whiteSpace:"nowrap"}}>
                {c}
              </button>;
            })}
          </div>

          {/* RORO reference cards */}
          {(catF==="All"||catF==="Risk-On"||catF==="Risk-Off")&&<div style={{padding:"8px 12px 0",display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            <div style={{background:"rgba(40,204,120,0.07)",border:"1px solid rgba(40,204,120,0.2)",borderRadius:9,padding:"8px 10px"}}>
              <div style={{fontSize:9,color:C.up,fontWeight:700,marginBottom:4,letterSpacing:".06em"}}>🟢 RISK-ON</div>
              <div style={{fontSize:9,color:C.txt2,lineHeight:1.7}}>US Equities ▲<br/>Oil ▲ · AUD ▲<br/>GBP/JPY ▲</div>
            </div>
            <div style={{background:"rgba(240,64,64,0.07)",border:"1px solid rgba(240,64,64,0.2)",borderRadius:9,padding:"8px 10px"}}>
              <div style={{fontSize:9,color:C.dn,fontWeight:700,marginBottom:4,letterSpacing:".06em"}}>🔴 RISK-OFF</div>
              <div style={{fontSize:9,color:C.txt2,lineHeight:1.7}}>Gold ▲ · JPY ▲<br/>DXY ▲ · Bonds ▲<br/>VIX ▲</div>
            </div>
          </div>}

          {/* Yield curve — simplified */}
          {(catF==="All"||catF==="Bonds")&&spread!==null&&<div style={{padding:"8px 12px",borderBottom:"1px solid "+C.border,marginTop:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.bg1,border:"1px solid "+(inverted?"rgba(240,64,64,0.25)":"rgba(40,204,120,0.2)"),borderRadius:8,padding:"9px 12px"}}>
              <div>
                <div style={{fontSize:9,color:C.txt2,letterSpacing:".1em",marginBottom:2}}>YIELD CURVE 2s10s</div>
                <div style={{fontSize:14,fontWeight:600,color:inverted?C.dn:C.up}}>{spread>0?"+":""}{spread}%</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:12,fontWeight:700,color:inverted?C.dn:C.up}}>{inverted?"▼ INVERTED":"▲ NORMAL"}</div>
                {y2&&y10&&<div style={{fontSize:9,color:C.txt3,marginTop:2}}>2Y {y2.cur.toFixed(3)}% · 10Y {y10.cur.toFixed(3)}%</div>}
              </div>
            </div>
          </div>}

          {/* VIX — simplified */}
          {(catF==="All"||catF==="Risk-Off")&&vixI&&<div style={{padding:"8px 12px",borderBottom:"1px solid "+C.border}}>
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:"10px 13px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:9,color:C.txt2,letterSpacing:".1em",marginBottom:2}}>VIX — FEAR INDEX</div>
                <div style={{fontSize:22,fontWeight:700,color:vixClr(vixI.cur),fontFamily:"'Syne',sans-serif"}}>{vixI.cur.toFixed(2)}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:13,fontWeight:700,color:vixClr(vixI.cur)}}>{vixLbl(vixI.cur)}</div>
                <div style={{fontSize:10,color:C.txt2,marginTop:2}}>{vixI.pct>=0?"+":""}{vixI.pct.toFixed(2)}% today</div>
              </div>
            </div>
          </div>}

          {/* Chart Grid — Terminal Dark 3-col */}
          <div style={{padding:"6px 8px 16px"}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.txt3,letterSpacing:".1em",padding:"4px 2px 6px"}}>
              MARKETS · {displayed.filter(function(m:any){return m.s!=="VIX";}).length} INSTRUMENTS · TAP TO EXPAND
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:3,
              background:"#000",border:"1px solid #000",borderRadius:10,overflow:"hidden"}}>
              {displayed.filter(function(m:any){return m.s!=="VIX";}).map(function(m:any,i:number){
                var up=m.pct>=0;
                var cc=m.cat==="Commodities"?C.amber:m.cat==="Indices"?C.up:m.cat==="Volatility"?C.vix:m.cat==="Bonds"?C.bond:C.blue;
                var cbg=m.cat==="Commodities"?"linear-gradient(160deg,#0f1208,#080c05)":m.cat==="Indices"?"linear-gradient(160deg,#061510,#030e08)":m.cat==="Volatility"?"linear-gradient(160deg,#0e0814,#08050f)":m.cat==="Bonds"?"linear-gradient(160deg,#061418,#030e12)":"linear-gradient(160deg,#06101a,#030c14)";
                var cb=m.cat==="Commodities"?"rgba(240,160,32,0.28)":m.cat==="Indices"?"rgba(34,212,110,0.22)":m.cat==="Volatility"?"rgba(176,96,240,0.25)":m.cat==="Bonds"?"rgba(32,200,216,0.22)":"rgba(74,158,255,0.22)";
                var cardH=screenW<480?54:62;
                return <div key={m.s} onClick={function(){openInstDetail(m);}} className="tap"
                  style={{background:cbg,outline:"1px solid "+cb,outlineOffset:"-1px",
                    cursor:"pointer",position:"relative",overflow:"hidden",
                    animation:"fu 0.35s ease forwards",animationDelay:(i*30)+"ms",opacity:0}}>
                  <div style={{height:2,background:"linear-gradient(90deg,"+cc+"aa,"+cc+"22)",position:"absolute",top:0,left:0,right:0}}/>
                  <div style={{padding:"7px 6px 3px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{display:"flex",alignItems:"center",gap:3}}>
                      <div style={{width:2.5,height:10,background:cc,borderRadius:1,flexShrink:0}}/>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:screenW<480?7:8,fontWeight:600,color:"#f0f5ff",letterSpacing:".03em"}}>{m.l}</span>
                    </div>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:screenW<480?8:9,fontWeight:700,color:up?C.up:C.dn}}>{up?"+":""}{m.pct.toFixed(2)}%</span>
                  </div>
                  <div style={{height:cardH,background:"#0a0e1a"}}>
                    {(function(){
                      var gcgId="gcg_"+m.s.replace(/[^a-z0-9]/gi,"_");
                      return <ResponsiveContainer width="100%" height={cardH}>
                        <AreaChart data={samplePts(m.ch,30)} margin={{top:2,right:0,bottom:0,left:0}}>
                          <defs>
                            <linearGradient id={gcgId} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="rgba(232,213,163,0.22)"/>
                              <stop offset="100%" stopColor="rgba(232,213,163,0)"/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={true} horizontal={true} strokeDasharray=""/>
                          <YAxis domain={["auto","auto"]} hide/>
                          <Area type="monotone" dataKey="p" stroke="#e8d5a3" strokeWidth={1.5} fill={"url(#"+gcgId+")"} dot={false} activeDot={{r:2,fill:"#e8d5a3",strokeWidth:0}}/>
                        </AreaChart>
                      </ResponsiveContainer>;
                    })()}
                  </div>
                  <div style={{padding:"3px 6px 5px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7.5,color:C.txt3}}>{fmt(m.cur,m.b)}</span>
                    <span style={{fontSize:8,color:up?C.up:C.dn}}>{up?"▲":"▼"}</span>
                  </div>
                </div>;
              })}
            </div>
          </div>
        </div>}

        {/* ── SESSION BRIEFING ── */}
        {tab==="session"&&<div style={{padding:"12px"}} className="fu">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:C.txt0,letterSpacing:".06em"}}>SESSION BRIEFING</div>
              <div style={{fontSize:9,color:C.txt2,marginTop:1}}>{nowStr}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:9,color:ctxCount>=10?C.dn:C.txt3}}>{ctxCount}/10</span>
              <button className="tap" onClick={fetchCtx} disabled={ctxLoading||ctxCount>=10}
                style={{background:ctxLoading||ctxCount>=10?C.bg2:C.gold,color:ctxLoading||ctxCount>=10?C.txt2:"#0c1118",border:"none",borderRadius:8,padding:"7px 14px",fontSize:9,fontWeight:500,display:"flex",alignItems:"center",gap:5}}>
                {ctxLoading?[<div key="sp" className="sp" style={{width:10,height:10,border:"2px solid "+C.border2,borderTopColor:C.txt1,borderRadius:"50%"}}></div>,"GENERATING…"]:ctxCount>=10?"◉ LIMIT REACHED":"◉ GENERATE"}
              </button>
            </div>
          </div>
          <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:10}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",marginBottom:8}}>LIVE SNAPSHOT</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {["XAU/USD","DX","US10Y","VIX","SPX","NDX","WTI/USD","GBP/USD"].map(function(sym){
                var m=mkt.find(function(d){return d.s===sym;});if(!m)return null;
                var up=m.pct>=0;var isBond=m.cat==="Bonds";var isVix=m.s==="VIX";
                return <div key={sym} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.bg2,borderRadius:7,padding:"7px 10px",border:"1px solid "+C.border}}>
                  <div>
                    <div style={{fontSize:9,color:C.txt2}}>{m.l}</div>
                    <div style={{fontSize:13,fontWeight:500,color:isVix?vixClr(m.cur):isBond?C.bond:C.txt0,fontVariantNumeric:"tabular-nums"}}>{fmt(m.cur,m.b)}{isBond?"%":""}</div>
                  </div>
                  <div style={{fontSize:11,fontWeight:500,color:isVix?(up?C.dn:C.up):up?C.up:C.dn}}>{up?"+":""}{m.pct.toFixed(2)}%</div>
                </div>;
              })}
            </div>
          </div>
          {spread!==null&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:10,color:C.txt2,letterSpacing:".1em"}}>YIELD CURVE 2s10s</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:14,fontWeight:600,color:inverted?C.dn:C.up}}>{spread>0?"+":""}{spread}%</span>
                <span style={{fontSize:11,fontWeight:700,color:inverted?C.dn:C.up,background:inverted?"rgba(240,64,64,0.1)":"rgba(40,204,120,0.1)",border:"1px solid "+(inverted?C.dn:C.up)+"44",borderRadius:5,padding:"2px 7px"}}>{inverted?"▼ INVERTED":"▲ NORMAL"}</span>
              </div>
            </div>
          </div>}
          {ctxErr&&<div style={{background:"rgba(240,64,64,0.07)",border:"1px solid rgba(240,64,64,0.2)",borderRadius:8,padding:"10px 12px",color:C.dn,fontSize:12,marginBottom:10}}>⚠ {ctxErr}</div>}
          {!ctx&&!ctxLoading&&!ctxErr&&<div style={{textAlign:"center",padding:"30px 20px",background:C.bg1,border:"1px solid "+C.border,borderRadius:10}}>
            <div style={{fontSize:11,color:C.txt3,letterSpacing:".1em"}}>TAP GENERATE FOR AI SESSION BRIEFING</div>
            <div style={{fontSize:10,color:C.txt3,marginTop:4,opacity:0.6}}>DXY dominance · Money flow · Weekly outlook · Risk-On/Off analysis</div>
          </div>}
          {ctx&&<div className="fu">
            {/* Regime bar */}
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:5,
                    color:SC[ctx.sessionBias as keyof typeof SC]||C.txt1,
                    background:(SC[ctx.sessionBias as keyof typeof SC]||C.txt1)+"18",
                    border:"1px solid "+(SC[ctx.sessionBias as keyof typeof SC]||C.txt1)+"44"}}>
                    {ctx.sessionBias}
                  </span>
                  {ctx.goldBias&&<span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:5,
                    color:DC[ctx.goldBias as keyof typeof DC]||C.txt1,
                    background:(DC[ctx.goldBias as keyof typeof DC]||C.txt1)+"18",
                    border:"1px solid "+(DC[ctx.goldBias as keyof typeof DC]||C.txt1)+"44"}}>
                    AU {ctx.goldBias}
                  </span>}
                </div>
                {lastRefresh&&<span style={{fontSize:9,color:C.txt3}}>{lastRefresh.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>}
              </div>
              {ctx.nothingNew&&ctx.nothingNew!=="false"&&<div style={{background:"rgba(58,85,112,0.15)",border:"1px solid "+C.border,borderRadius:6,padding:"7px 10px",marginBottom:6}}>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.txt2,fontWeight:600}}>QUIET LAST HOUR — </span>
                <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,color:C.txt1}}>{ctx.regimeUpdate}</span>
              </div>}
              {ctx.sessionSummary&&<div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,color:C.txt0,lineHeight:1.8}}>{ctx.sessionSummary}</div>}
              {ctx.regimeUpdate&&!ctx.sessionSummary&&(!ctx.nothingNew||ctx.nothingNew==="false")&&<div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,color:C.txt0,lineHeight:1.8}}>{ctx.regimeUpdate}</div>}
            </div>
            {/* Breaking news */}
            {ctx.breaking&&ctx.breaking.length>0&&<div style={{marginBottom:8}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:7}}>⚡ BREAKING</div>
              {ctx.breaking.map(function(item:any,i:number){
                var ic=item.impact&&item.impact.includes("BULLISH")?C.up:item.impact&&item.impact.includes("BEARISH")?C.dn:item.impact==="RISK-OFF"?C.dn:item.impact==="RISK-ON"?C.up:C.amber;
                var tc=item.typeColor||C.blue;
                return <div key={i} style={{background:C.bg1,border:"1px solid "+ic+"33",borderLeft:"3px solid "+ic,borderRadius:9,padding:"11px 13px",marginBottom:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:9,fontWeight:700,color:tc,background:tc+"18",padding:"1px 6px",borderRadius:3}}>{item.type}</span>
                      <span style={{fontSize:9,color:C.txt3}}>{item.time}</span>
                    </div>
                    <span style={{fontSize:9,fontWeight:700,color:ic,background:ic+"18",padding:"2px 7px",borderRadius:4,border:"1px solid "+ic+"44"}}>{item.impact}</span>
                  </div>
                  <div style={{fontSize:13,fontWeight:600,color:C.txt0,lineHeight:1.45,marginBottom:6}}>{item.headline}</div>
                  <div style={{fontSize:12,color:C.txt1,lineHeight:1.7,marginBottom:6}}>{item.detail}</div>
                  {item.goldReaction&&<div style={{background:"rgba(0,0,0,0.2)",borderRadius:5,padding:"5px 8px",marginBottom:5}}>
                    <span style={{fontSize:9,color:C.gold,fontWeight:600}}>Gold: </span>
                    <span style={{fontSize:10,color:C.txt0}}>{item.goldReaction}</span>
                  </div>}
                  {item.tradingNote&&<div style={{borderLeft:"2px solid "+ic,paddingLeft:8}}>
                    <span style={{fontSize:9,color:ic,fontWeight:600}}>NOW: </span>
                    <span style={{fontSize:10,color:C.txt0}}>{item.tradingNote}</span>
                  </div>}
                </div>;
              })}
            </div>}
            {/* Market moves */}
            {ctx.marketMoves&&ctx.marketMoves.length>0&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:7}}>MARKET MOVES</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                {ctx.marketMoves.map(function(m:any,i:number){
                  var up=m.direction==="up";
                  return <div key={i} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:7,padding:"8px 10px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                      <span style={{fontSize:12,fontWeight:600,color:C.txt0}}>{m.symbol}</span>
                      <span style={{fontSize:11,fontWeight:600,color:up?C.up:C.dn}}>{m.change}</span>
                    </div>
                    {m.from&&m.to&&<div style={{fontSize:9,color:C.txt3,marginBottom:2}}>{m.from} → {m.to}</div>}
                    {m.note&&<div style={{fontSize:10,color:C.txt2,lineHeight:1.4}}>{m.note}</div>}
                  </div>;
                })}
              </div>
            </div>}
            {/* Next up */}
            {ctx.nextUp&&ctx.nextUp.length>0&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px"}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:7}}>NEXT UP</div>
              {ctx.nextUp.map(function(n:any,i:number){
                var ic=n.impact==="HIGH"?C.dn:C.amber;
                return <div key={i} style={{display:"flex",gap:8,padding:"6px 0",borderBottom:i<ctx.nextUp.length-1?"1px solid "+C.border:"none",alignItems:"flex-start"}}>
                  <span style={{fontSize:10,color:C.gold,flexShrink:0,minWidth:50,fontWeight:600}}>{n.time}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:600,color:C.txt0,marginBottom:2}}>{n.event}</div>
                    {n.note&&<div style={{fontSize:10,color:C.txt2,lineHeight:1.4}}>{n.note}</div>}
                  </div>
                  <span style={{fontSize:8,fontWeight:700,color:ic,flexShrink:0}}>{n.impact}</span>
                </div>;
              })}
            </div>}
          </div>}
        </div>}

        {/* ── INTELLIGENCE ── */}
        {tab==="intel"&&(
          <div style={{padding:"12px"}} className="fu">
            {/* Session selector */}
            <div style={{marginBottom:12}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".12em",fontWeight:600,marginBottom:8}}>⬟ AUXIRON BRIEF</div>
              <div style={{display:"grid",gap:5}}>
                {[
                  {key:"asia",icon:"🌏",label:"ASIA OPEN",time:"6am–3pm SGT",color:C.bond},
                  {key:"london",icon:"🌍",label:"LONDON OPEN",time:"4pm–1am SGT",color:C.blue},
                  {key:"ny",icon:"🗽",label:"NY SESSION",time:"9pm–6am SGT",color:C.goldL},
                ].map(function(s){
                  var active=intelSession===s.key;
                  var cached=!!(intelCache[s.key]&&intelCache[s.key].p1&&(intelCache[s.key].p1.headline||intelCache[s.key].p1.executiveSummary||intelCache[s.key].p1.marketRegime));
                  var cacheEntry=intelCache[s.key];
                  var sessionActive=isSessionActive(s.key);
                  var isLoading=active&&(intelPhase==="p1loading"||intelPhase==="p2loading");
                  var isLocked=!sessionActive&&!cached;
                  var generatedAt=cacheEntry?.generatedAt?new Date(cacheEntry.generatedAt).toLocaleString("en-SG",{timeZone:"Asia/Singapore",hour:"2-digit",minute:"2-digit",day:"numeric",month:"short"}):null;
                  return <div key={s.key} style={{borderRadius:10,overflow:"hidden",
                    border:"1px solid "+(active?s.color+"55":cached?"rgba(34,212,110,0.28)":isLocked?C.txt3+"18":C.border)}}>
                    {/* Main card row */}
                    <button className="tap"
                      onClick={function(){
                        setIntelSession(s.key);
                        if(s.key==="ny"){
                          var isMonday=new Date().getDay()===1;
                          var briefSession=isMonday?"monday":"daily";
                          setIntelPhase("idle");setIntelP1(null);setIntelP2(null);setIntelErr(null);
                          setBriefLoading(true);setBriefData(null);setBriefErr(null);
                          fetch("/api/brief?session="+briefSession)
                            .then(function(r){return r.json();})
                            .then(function(d){setBriefData(d);setBriefLoading(false);})
                            .catch(function(e:any){setBriefErr(e?.message||"Fetch failed");setBriefLoading(false);});
                        } else if(cached&&isValidP1(intelCache[s.key]?.p1)){
                          var entry=intelCache[s.key];
                          setIntelP1(entry.p1);
                          setIntelP2(entry.p2||null);
                          setIntelPhase("complete");
                          setIntelErr(null);
                        } else if(!isLocked){
                          fetchIntel(s.key);
                        }
                      }}
                      style={{background:active?"rgba(0,0,0,0.25)":cached?"rgba(34,212,110,0.05)":isLocked?"rgba(0,0,0,0.06)":C.bg1,
                        border:"none",padding:"10px 14px",textAlign:"left",width:"100%",
                        opacity:isLocked?0.4:1,cursor:isLocked?"default":"pointer"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{display:"flex",alignItems:"center",gap:9}}>
                          <span style={{fontSize:17}}>{s.icon}</span>
                          <div>
                            <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,fontWeight:700,
                              color:active?s.color:cached?C.up:C.txt0}}>{s.label}</div>
                            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,
                              color:active?s.color:isLocked?C.txt3:sessionActive?C.up:cached?C.txt2:C.txt2}}>
                              {isLocked?"🔒 Unlocks at "+getSessionUnlockSGT(s.key)
                                :cached?"✓ Saved · "+s.time
                                :sessionActive?"● LIVE NOW · "+s.time
                                :s.time}
                            </div>
                          </div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          {sessionActive&&!cached&&!isLoading&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:s.color,background:s.color+"12",padding:"2px 8px",borderRadius:4,border:"1px solid "+s.color+"30"}}>Generate ▸</span>}
                          {isLoading&&<div className="sp" style={{width:10,height:10,border:"2px solid "+C.border2,borderTopColor:s.color,borderRadius:"50%"}}/>}
                          {active&&!isLoading&&intelPhase==="complete"&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.up}}>✓</span>}
                        </div>
                      </div>
                    </button>
                    {/* VIEW SAVED REPORT button — only when cached and not currently active/showing */}
                    {s.key!=="ny"&&cached&&isValidP1(intelCache[s.key]?.p1)&&!(active&&intelPhase==="complete")&&!isLoading&&(
                      <button className="tap"
                        onClick={function(){
                          var entry=intelCache[s.key];
                          setIntelSession(s.key);
                          if(entry&&(entry.p1||entry.p2)){
                            setIntelP1(entry.p1||null);
                            setIntelP2(entry.p2||null);
                            setIntelPhase("complete");
                            setIntelErr(null);
                          } else {
                            setIntelPhase("idle");
                            setIntelP1(null);setIntelP2(null);
                            setIntelErr("⚠ Saved report data is incomplete or corrupted. Please generate a fresh report.");
                          }
                        }}
                        style={{width:"100%",background:"rgba(34,212,110,0.07)",
                          border:"none",borderTop:"1px solid rgba(34,212,110,0.15)",
                          padding:"8px 14px",cursor:"pointer",
                          display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <span style={{fontSize:11}}>📋</span>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,
                            color:C.up,letterSpacing:".06em"}}>VIEW SAVED REPORT</span>
                        </div>
                        <div style={{textAlign:"right"}}>
                          {generatedAt&&<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.txt3}}>
                            Generated {generatedAt}
                          </div>}
                        </div>
                      </button>
                    )}
                  </div>;
                })}
              </div>
            </div>

            {/* ── AUXIRON BRIEF DISPLAY (NY SESSION) ── */}
            {intelSession==="ny"&&(
              <div>
                {briefLoading&&<div style={{padding:"20px 0",fontSize:12,color:C.txt2,textAlign:"center"}}>Generating brief...</div>}
                {!briefLoading&&(briefErr||(briefData?.error))&&(
                  <div style={{background:"rgba(240,64,64,0.07)",border:"1px solid rgba(240,64,64,0.2)",borderRadius:8,padding:"10px 12px",color:C.dn,fontSize:12,marginBottom:10}}>
                    {"Brief unavailable — "+(briefErr||(briefData?.message)||"Unknown error")}
                  </div>
                )}
                {!briefLoading&&briefData&&!briefData.error&&(
                  <div className="fu">
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.amber,marginBottom:10,letterSpacing:".06em"}}>
                      {briefData?.cached
                        ?"Cached brief — generated "+Math.round((Date.now()-new Date(briefData?.generatedAt??"").getTime())/3600000)+" hours ago"
                        :"Generated at "+new Date(briefData?.generatedAt??"").toLocaleString("en-SG",{timeZone:"Asia/Singapore",hour:"2-digit",minute:"2-digit",day:"numeric",month:"short"})}
                    </div>
                    <div style={{fontSize:11,color:C.txt2,marginBottom:8,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:".06em"}}>
                      {"XAU/USD: "+(briefData?.goldPrice??"--")}
                    </div>
                    <div>
                      {(briefData?.content??"Brief not available").split("\n").map(function(line:string,i:number){
                        if(line.startsWith("## ")){
                          return <div key={i} style={{borderLeft:"2px solid "+C.amber,paddingLeft:8,marginTop:16,marginBottom:6,fontSize:10,fontFamily:"'IBM Plex Mono',monospace",color:C.amber,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700}}>{line.slice(3)}</div>;
                        }
                        if(line.startsWith("BIAS: ")){
                          const biasVal=line.slice(6).trim();
                          const biasClr=biasVal==="LONG"?C.up:biasVal==="SHORT"?C.dn:C.amber;
                          return <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                            <span style={{fontSize:11,color:C.txt1}}>{"BIAS: "}</span>
                            <span style={{fontSize:11,fontWeight:700,color:biasClr,background:biasClr+"22",border:"1px solid "+biasClr+"55",borderRadius:4,padding:"1px 8px"}}>{biasVal}</span>
                          </div>;
                        }
                        if(line.startsWith("GRADE: ")){
                          const gradeVal=line.slice(7).trim();
                          const gradeClr=gradeVal==="A+"?C.gold:gradeVal==="A"?C.up:gradeVal==="B"?C.amber:C.txt2;
                          return <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                            <span style={{fontSize:11,color:C.txt1}}>{"GRADE: "}</span>
                            <span style={{fontSize:11,fontWeight:700,color:gradeClr,background:gradeClr+"22",border:"1px solid "+gradeClr+"55",borderRadius:4,padding:"1px 8px"}}>{gradeVal}</span>
                          </div>;
                        }
                        if(line.startsWith("CONFIDENCE: ")){
                          const confVal=line.slice(12).trim();
                          const confClr=confVal==="HIGH"?C.up:confVal==="MEDIUM"?C.amber:C.dn;
                          return <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                            <span style={{fontSize:11,color:C.txt1}}>{"CONFIDENCE: "}</span>
                            <span style={{fontSize:11,fontWeight:700,color:confClr}}>{confVal}</span>
                          </div>;
                        }
                        if(line.startsWith("DOMINANT REGIME: ")){
                          const regVal=line.slice(17).trim();
                          return <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                            <span style={{fontSize:11,color:C.txt1}}>{"DOMINANT REGIME: "}</span>
                            <span style={{fontSize:10,fontWeight:700,color:C.blue,background:"rgba(74,158,255,0.12)",border:"1px solid rgba(74,158,255,0.3)",borderRadius:20,padding:"2px 10px"}}>{regVal}</span>
                          </div>;
                        }
                        if(line.startsWith("MACRO SCORE: ")){
                          return <div key={i} style={{fontSize:12,fontWeight:700,color:C.txt0,marginBottom:3}}>{line}</div>;
                        }
                        if(!line.trim()){return <div key={i} style={{height:4}}/>;}
                        return <div key={i} style={{fontSize:11,color:C.txt0,lineHeight:1.7,fontFamily:"'IBM Plex Sans',sans-serif",marginBottom:2}}>{line}</div>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No-content fallback: complete but nothing to show (corrupted cache) */}
            {intelPhase==="complete"&&intelP1&&!intelP1.headline&&!intelP1.executiveSummary&&!intelP1.marketRegime&&(
              <div style={{background:"rgba(240,160,32,0.07)",border:"1px solid rgba(240,160,32,0.2)",
                borderRadius:10,padding:"14px",marginBottom:10,textAlign:"center"}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.amber,marginBottom:6,letterSpacing:".08em"}}>⚠ REPORT DATA INCOMPLETE</div>
                <div style={{fontSize:12,color:C.txt2,marginBottom:10}}>
                  The saved report exists but content could not be read — likely saved by an older version.
                </div>
                <button className="tap" onClick={function(){
                  setIntelCache(function(p:any){
                    var n={...p};delete n[intelSession];
                    try{localStorage.setItem("auxiron_intel_cache",JSON.stringify(n));}catch(e){}
                    return n;
                  });
                  setIntelP1(null);setIntelP2(null);setIntelErr(null);
                  // If session is currently active, auto-generate immediately
                  if(isSessionActive(intelSession)){
                    fetchIntel(intelSession);
                  } else {
                    setIntelPhase("idle");
                  }
                }} style={{background:C.gold,color:"#080e14",border:"none",borderRadius:8,
                  padding:"7px 18px",fontFamily:"'IBM Plex Mono',monospace",fontSize:10,
                  fontWeight:700,cursor:"pointer"}}>
                  Clear & Generate Fresh
                </button>
              </div>
            )}
            {/* Error state */}
            {intelErr&&intelSession!=="ny"&&<div style={{
              background:intelErr.startsWith("🔒")?"rgba(58,85,112,0.15)":"rgba(240,69,69,0.07)",
              border:"1px solid "+(intelErr.startsWith("🔒")?C.border:"rgba(240,69,69,0.2)"),
              borderRadius:10,padding:"12px 14px",marginBottom:10,
              fontFamily:"'IBM Plex Sans',sans-serif"}}>
              <div style={{fontSize:13,fontWeight:600,color:intelErr.startsWith("🔒")?C.txt1:C.dn,lineHeight:1.6}}>
                {intelErr}
              </div>
            </div>}

            {/* Idle state */}
            {intelPhase==="idle"&&!intelErr&&intelSession!=="ny"&&(
              <div style={{textAlign:"center",padding:"36px 20px",background:C.bg1,border:"1px solid "+C.border,borderRadius:12}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,marginBottom:8,opacity:0.15}}>⬟</div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:C.txt3,letterSpacing:".1em",marginBottom:4}}>SELECT SESSION ABOVE</div>
                <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt3}}>Tap a session to generate your pre-market intelligence report</div>
              </div>
            )}

            {/* Streaming progress bar */}
            {(intelPhase==="p1loading"||intelPhase==="p2loading")&&(
              <div>
                <div style={{height:3,background:C.bg2,borderRadius:2,overflow:"hidden",marginBottom:10}}>
                  <div style={{height:"100%",
                    background:"linear-gradient(90deg,"+C.gold+","+C.goldL+")",
                    width:(intelPhase==="p2loading"?intelP2Progress:intelP1Progress)+"%",
                    transition:"width 0.5s ease",boxShadow:"0 0 8px "+C.gold}}/>
                </div>
                <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,
                  padding:"11px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div className="sp" style={{width:13,height:13,border:"2px solid "+C.border2,
                    borderTopColor:C.gold,borderRadius:"50%",flexShrink:0}}/>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,color:C.gold,
                    letterSpacing:".12em",fontWeight:600}}>GENERATING...</div>
                  <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:C.up,animation:"pulse 1.1s ease infinite"}}/>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.up}}>LIVE</span>
                  </div>
                </div>
              </div>
            )}
            {/* Skeletons only when no content yet */}
            {intelPhase==="p1loading"&&!(intelP1&&intelP1.headline)&&(
              <div>{[80,110,90].map(function(h,i){return <div key={i} style={{height:h,background:"linear-gradient(90deg,#121d2c 25%,#1a2840 50%,#121d2c 75%)",backgroundSize:"200% 100%",borderRadius:9,marginBottom:7,animation:"shimmer 1.4s infinite"}}/>;})}</div>
            )}

            {/* Phase 1 content — progressive */}
            {intelP1&&(intelP1.headline||intelP1.executiveSummary||intelP1.marketRegime)&&(
              <div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                  <div style={{flex:1,height:1,background:C.border}}/>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.up,background:"rgba(34,212,110,0.08)",border:"1px solid rgba(34,212,110,0.2)",borderRadius:4,padding:"2px 8px"}}>✓ PHASE 1 · ALERTS + CALENDAR</span>
                  <div style={{flex:1,height:1,background:C.border}}/>
                </div>

                {/* Header */}
                <div style={{background:"linear-gradient(135deg,rgba(212,168,67,0.1),rgba(212,168,67,0.03))",border:"1px solid rgba(212,168,67,0.28)",borderRadius:10,padding:"13px",marginBottom:8}}>
                  <div style={{display:"flex",gap:6,marginBottom:5,flexWrap:"wrap",alignItems:"center"}}>
                    {intelP1.marketRegime&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:4,color:intelP1.marketRegime==="RISK-OFF"?C.dn:intelP1.marketRegime==="RISK-ON"?C.up:C.amber,background:(intelP1.marketRegime==="RISK-OFF"?C.dn:intelP1.marketRegime==="RISK-ON"?C.up:C.amber)+"18",border:"1px solid "+(intelP1.marketRegime==="RISK-OFF"?C.dn:intelP1.marketRegime==="RISK-ON"?C.up:C.amber)+"44"}}>{intelP1.marketRegime}</span>}
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.txt3}}>{intelP1.generatedAt} · {intelP1.validFor}</span>
                    {intelCache[intelSession]?.generatedAt&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.up}}>✓ Saved locally</span>}
                  </div>
                  {intelP1.headline&&<div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:14,fontWeight:700,color:C.txt0,lineHeight:1.45,marginBottom:6}}>{intelP1.headline}</div>}
                  {intelP1.executiveSummary&&<div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt1,lineHeight:1.75}}>{intelP1.executiveSummary}</div>}
                  {intelP1.regimeDrivers&&<div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,color:C.txt2,lineHeight:1.65,marginTop:5}}>{intelP1.regimeDrivers}</div>}
                </div>

                {/* Priority Alerts */}
                {intelP1.alerts&&intelP1.alerts.length>0&&<div style={{marginBottom:8}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:7}}>⚡ PRIORITY ALERTS</div>
                  {intelP1.alerts.map(function(a:any,i:number){
                    return <div key={i} style={{background:a.color+"0e",border:"1px solid "+a.color+"33",borderLeft:"3px solid "+a.color,borderRadius:9,padding:"11px 12px",marginBottom:6}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,color:a.color,letterSpacing:".08em",marginBottom:4}}>P{a.priority} · {a.type}</div>
                      <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,fontWeight:700,color:C.txt0,lineHeight:1.4,marginBottom:5}}>{a.headline}</div>
                      <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt1,lineHeight:1.7,marginBottom:6}}>{a.detail}</div>
                      {a.monitor&&<div style={{background:"rgba(0,0,0,0.2)",borderRadius:5,padding:"5px 8px",borderLeft:"2px solid "+a.color}}>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:a.color,fontWeight:600}}>MONITOR: </span>
                        <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,color:C.txt0}}>{a.monitor}</span>
                      </div>}
                    </div>;
                  })}
                </div>}

                {/* Overnight Recap */}
                {intelP1.overnightRecap&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:8}}>🌍 OVERNIGHT RECAP</div>
                  {[["Asia",intelP1.overnightRecap.asia,C.bond],["Europe",intelP1.overnightRecap.europe,C.blue]].map(function(row:any){
                    var name=row[0];var data=row[1];var color=row[2];
                    if(!data)return null;
                    return <div key={name} style={{background:C.bg2,border:"1px solid "+color+"22",borderRadius:8,padding:"9px 11px",marginBottom:5}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:color,fontWeight:600}}>{name.toUpperCase()} SESSION</span>
                        {data.keyMove&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.gold}}>{data.keyMove}</span>}
                      </div>
                      <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt1,lineHeight:1.65}}>{data.summary}</div>
                    </div>;
                  })}
                  {intelP1.overnightRecap.usFutures&&<div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"9px 11px",marginBottom:5}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.amber,fontWeight:600}}>US FUTURES</span>
                      <div style={{display:"flex",gap:8}}>
                        {intelP1.overnightRecap.usFutures.spx&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.txt2}}>SPX <span style={{color:intelP1.overnightRecap.usFutures.spx.startsWith("+")?C.up:C.dn}}>{intelP1.overnightRecap.usFutures.spx}</span></span>}
                        {intelP1.overnightRecap.usFutures.ndx&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.txt2}}>NDX <span style={{color:intelP1.overnightRecap.usFutures.ndx.startsWith("+")?C.up:C.dn}}>{intelP1.overnightRecap.usFutures.ndx}</span></span>}
                      </div>
                    </div>
                    {intelP1.overnightRecap.usFutures.note&&<div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt1}}>{intelP1.overnightRecap.usFutures.note}</div>}
                  </div>}
                  {intelP1.overnightRecap.sessionHL&&<div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"9px 11px"}}>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.txt2,marginBottom:6}}>SESSION HIGHS & LOWS</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
                      {[["GOLD",intelP1.overnightRecap.sessionHL.gold,C.gold],["DXY",intelP1.overnightRecap.sessionHL.dxy,C.blue],["USD/JPY",intelP1.overnightRecap.sessionHL.usdJpy,C.jpy]].map(function(row:any){
                        var name=row[0];var hl=row[1];var color=row[2];
                        if(!hl||!hl.high)return null;
                        return <div key={name} style={{textAlign:"center"}}>
                          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:color,marginBottom:2}}>{name}</div>
                          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.up}}>H: {hl.high}</div>
                          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.dn}}>L: {hl.low}</div>
                        </div>;
                      })}
                    </div>
                  </div>}
                </div>}

                {/* VIX Snapshot */}
                {intelP1.vixSnapshot&&<div style={{background:"rgba(176,96,240,0.07)",border:"1px solid rgba(176,96,240,0.22)",borderRadius:10,padding:"12px",marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.vix,fontWeight:600,letterSpacing:".1em"}}>📊 VIX ANALYSIS</div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:20,fontWeight:600,color:intelP1.vixSnapshot.labelColor||C.amber,lineHeight:1}}>{intelP1.vixSnapshot.level}</div>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.dn}}>{intelP1.vixSnapshot.chgPct}</div>
                    </div>
                  </div>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:4,color:intelP1.vixSnapshot.labelColor||C.amber,background:(intelP1.vixSnapshot.labelColor||C.amber)+"18",border:"1px solid "+(intelP1.vixSnapshot.labelColor||C.amber)+"44"}}>{intelP1.vixSnapshot.label}</span>
                  <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt0,lineHeight:1.75,margin:"7px 0 6px"}}>{intelP1.vixSnapshot.interpretation}</div>
                  {intelP1.vixSnapshot.impactOnGold&&<div style={{background:"rgba(176,96,240,0.08)",borderRadius:6,padding:"6px 9px",borderLeft:"2px solid "+C.vix}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.vix,fontWeight:600}}>GOLD: </span>
                    <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,color:C.txt0}}>{intelP1.vixSnapshot.impactOnGold}</span>
                  </div>}
                </div>}

                {/* Calendar */}
                {intelP1.calendar&&intelP1.calendar.length>0&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:8}}>📅 ECONOMIC CALENDAR</div>
                  {intelP1.calendar.map(function(ev:any,i:number){
                    var ic=ev.impact==="CRITICAL"?"#ff1840":ev.impact==="HIGH"?C.dn:C.amber;
                    return <div key={i} style={{background:C.bg2,border:"1px solid "+(ev.stars===3?"rgba(255,24,64,0.2)":"rgba(240,165,0,0.15)"),borderRadius:8,padding:"10px 12px",marginBottom:i<intelP1.calendar.length-1?5:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                            <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,fontWeight:700,color:C.txt0}}>{ev.flag} {ev.event}</span>
                            <span>{[1,2,3].map(function(s:number){return <span key={s} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:s<=ev.stars?C.amber:C.txt3}}>★</span>;})}</span>
                          </div>
                          <div style={{display:"flex",gap:8}}>
                            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:600,color:C.gold}}>{ev.time}</span>
                            {ev.forecast&&ev.forecast!=="—"&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2}}>Exp: <strong style={{color:C.txt0}}>{ev.forecast}</strong></span>}
                            {ev.prev&&ev.prev!=="—"&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2}}>Prev: <strong style={{color:C.txt0}}>{ev.prev}</strong></span>}
                          </div>
                        </div>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:3,color:ic,background:ic+"18",border:"1px solid "+ic+"33",flexShrink:0,marginLeft:6}}>{ev.impact}</span>
                      </div>
                      {(ev.goldBull||ev.goldBear)&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,marginBottom:ev.analysis?4:0}}>
                        {ev.goldBull&&<div style={{background:"rgba(34,212,110,0.07)",border:"1px solid rgba(34,212,110,0.2)",borderRadius:5,padding:"4px 7px"}}>
                          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.up,marginBottom:1}}>GOLD BULLISH IF</div>
                          <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,fontWeight:600,color:C.txt0}}>{ev.goldBull}</div>
                        </div>}
                        {ev.goldBear&&<div style={{background:"rgba(240,69,69,0.07)",border:"1px solid rgba(240,69,69,0.2)",borderRadius:5,padding:"4px 7px"}}>
                          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.dn,marginBottom:1}}>GOLD BEARISH IF</div>
                          <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,fontWeight:600,color:C.txt0}}>{ev.goldBear}</div>
                        </div>}
                      </div>}
                      {ev.analysis&&<div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,color:C.txt1,lineHeight:1.6}}>{ev.analysis}</div>}
                    </div>;
                  })}
                </div>}

                {/* Phase 2 skeleton — only if no content yet */}
                {intelPhase==="p2loading"&&!(intelP2&&Object.keys(intelP2).length>0)&&<div>
                  <div style={{display:"flex",alignItems:"center",gap:6,margin:"4px 0 8px"}}>
                    <div style={{flex:1,height:1,background:C.border}}/>
                    <div style={{display:"flex",alignItems:"center",gap:5,fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.amber,background:"rgba(240,160,32,0.08)",border:"1px solid rgba(240,160,32,0.2)",borderRadius:4,padding:"2px 8px"}}>
                      <div className="sp" style={{width:7,height:7,border:"1.5px solid rgba(240,160,32,0.3)",borderTopColor:C.amber,borderRadius:"50%"}}/>
                      PHASE 2 · MACRO + INSTRUMENTS
                    </div>
                    <div style={{flex:1,height:1,background:C.border}}/>
                  </div>
                  {[100,120,90].map(function(h,i){return <div key={i} style={{height:h,background:"linear-gradient(90deg,#121d2c 25%,#1a2840 50%,#121d2c 75%)",backgroundSize:"200% 100%",borderRadius:9,marginBottom:7,animation:"shimmer 1.4s infinite"}}/>;})}
                </div>}
              </div>
            )}

            {/* Phase 2 content — progressive */}
            {(intelPhase==="p2loading"||intelPhase==="complete")&&intelP2&&Object.keys(intelP2).length>0&&(
              <div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                  <div style={{flex:1,height:1,background:C.border}}/>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.gold,background:"rgba(212,168,67,0.08)",border:"1px solid rgba(212,168,67,0.2)",borderRadius:4,padding:"2px 8px"}}>✓ PHASE 2 · DEEP ANALYSIS</span>
                  <div style={{flex:1,height:1,background:C.border}}/>
                </div>

                {/* Inflation Risk */}
                {intelP2.inflationRisk&&<div style={{background:"rgba(240,160,32,0.07)",border:"1px solid rgba(240,160,32,0.22)",borderRadius:10,padding:"12px",marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.amber,fontWeight:600,letterSpacing:".1em"}}>📈 INFLATION RISK</div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:4,color:intelP2.inflationRisk.color||C.amber,background:(intelP2.inflationRisk.color||C.amber)+"18",border:"1px solid "+(intelP2.inflationRisk.color||C.amber)+"44"}}>{intelP2.inflationRisk.level}</span>
                      {intelP2.inflationRisk.realYield&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.txt2}}>Real yield: <span style={{color:C.dn}}>{intelP2.inflationRisk.realYield}</span></span>}
                    </div>
                  </div>
                  {intelP2.inflationRisk.drivers&&intelP2.inflationRisk.drivers.map(function(d:string,i:number){
                    return <div key={i} style={{display:"flex",gap:6,padding:"3px 0"}}>
                      <span style={{color:C.amber,fontSize:10,flexShrink:0}}>→</span>
                      <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt0}}>{d}</span>
                    </div>;
                  })}
                  {intelP2.inflationRisk.goldImplication&&<div style={{background:"rgba(212,168,67,0.08)",border:"1px solid rgba(212,168,67,0.2)",borderRadius:7,padding:"8px 10px",margin:"7px 0 5px"}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.gold,fontWeight:600}}>GOLD: </span>
                    <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt0,lineHeight:1.7}}>{intelP2.inflationRisk.goldImplication}</span>
                  </div>}
                  {intelP2.inflationRisk.fedCutProb&&<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.fed}}>Fed cut prob: <span style={{color:C.txt0}}>{intelP2.inflationRisk.fedCutProb}</span></div>}
                </div>}

                {/* Central Banks */}
                {intelP2.centralBanks&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.fed,fontWeight:600,letterSpacing:".1em",marginBottom:7}}>🏛 CENTRAL BANKS</div>
                  {intelP2.centralBanks.whichMattersTonight&&<div style={{background:"rgba(136,128,248,0.06)",border:"1px solid rgba(136,128,248,0.2)",borderRadius:6,padding:"6px 9px",marginBottom:7}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.fed,fontWeight:600}}>TONIGHT: </span>
                    <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,color:C.txt0}}>{intelP2.centralBanks.whichMattersTonight}</span>
                  </div>}
                  {[["FED",intelP2.centralBanks.fed,"#8880f8"],["BOJ",intelP2.centralBanks.boj,C.jpy],["ECB",intelP2.centralBanks.ecb,"#34d399"]].map(function(row:any){
                    var name=row[0];var cb=row[1];var color=row[2];
                    if(!cb)return null;
                    return <div key={name} style={{background:C.bg2,border:"1px solid "+color+"22",borderLeft:"2px solid "+color,borderRadius:7,padding:"8px 10px",marginBottom:5}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:color,fontWeight:600}}>{name}</span>
                        {cb.rate&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.txt2}}>Rate: <span style={{color:C.txt0}}>{cb.rate}</span></span>}
                      </div>
                      <div style={{display:"flex",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                        {cb.nextMeeting&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.txt2}}>Next: <span style={{color:C.gold}}>{cb.nextMeeting}</span></span>}
                        {(cb.cutProb||cb.hikeProb)&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.txt2}}>Prob: <span style={{color:C.up}}>{cb.cutProb||cb.hikeProb}</span></span>}
                      </div>
                      {cb.recentSignal&&<div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt1,lineHeight:1.6,marginBottom:3}}>{cb.recentSignal}</div>}
                      {cb.goldImpact&&<div style={{borderLeft:"2px solid "+color+"44",paddingLeft:7}}>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:color}}>GOLD: </span>
                        <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,color:C.txt0}}>{cb.goldImpact}</span>
                      </div>}
                    </div>;
                  })}
                </div>}

                {/* Macro */}
                {intelP2.macro&&intelP2.macro.length>0&&<div style={{marginBottom:8}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:7}}>🌐 MACRO FRAMEWORK</div>
                  {intelP2.macro.map(function(m:any,i:number){
                    return <div key={i} style={{background:C.bg1,border:"1px solid "+C.border,borderLeft:"3px solid "+(m.color||C.blue),borderRadius:9,padding:"11px 12px",marginBottom:6}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:700,color:m.color||C.blue,letterSpacing:".06em",marginBottom:6,textTransform:"uppercase"}}>{m.heading}</div>
                      <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt0,lineHeight:1.8,marginBottom:m.keyData?7:0}}>{m.body}</div>
                      {m.keyData&&<div style={{background:C.bg2,borderRadius:5,padding:"5px 8px",display:"flex",gap:6,flexWrap:"wrap"}}>
                        {m.keyData.split(" · ").map(function(d:string,j:number){return <span key={j} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2}}>• {d}</span>;})}
                      </div>}
                    </div>;
                  })}
                </div>}

                {/* Liquidity */}
                {intelP2.liquidityAssessment&&<div style={{background:"rgba(32,200,216,0.07)",border:"1px solid rgba(32,200,216,0.2)",borderRadius:10,padding:"12px",marginBottom:8}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.bond,fontWeight:600,letterSpacing:".1em",marginBottom:7}}>💧 LIQUIDITY ASSESSMENT</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:7}}>
                    <div style={{background:C.bg2,borderRadius:7,padding:"7px 9px",border:"1px solid "+C.border}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.txt3,marginBottom:1}}>SESSION LIQUIDITY</div>
                      <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,fontWeight:600,color:C.bond}}>{intelP2.liquidityAssessment.sessionLiquidity}</div>
                    </div>
                    {intelP2.liquidityAssessment.goldSpread&&<div style={{background:C.bg2,borderRadius:7,padding:"7px 9px",border:"1px solid "+C.border}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.txt3,marginBottom:1}}>GOLD SPREAD</div>
                      <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,fontWeight:600,color:C.txt0}}>{intelP2.liquidityAssessment.goldSpread}</div>
                    </div>}
                  </div>
                  {intelP2.liquidityAssessment.note&&<div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt0,lineHeight:1.7,marginBottom:5}}>{intelP2.liquidityAssessment.note}</div>}
                  {intelP2.liquidityAssessment.thinPeriods&&<div style={{background:"rgba(0,0,0,0.2)",borderRadius:5,padding:"5px 8px",borderLeft:"2px solid "+C.bond}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.bond,fontWeight:600}}>THIN: </span>
                    <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,color:C.txt0}}>{intelP2.liquidityAssessment.thinPeriods}</span>
                  </div>}
                </div>}

                {/* Position Management */}
                {intelP2.positionManagement&&<div style={{background:"rgba(34,212,110,0.06)",border:"1px solid rgba(34,212,110,0.2)",borderRadius:10,padding:"12px",marginBottom:8}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.up,fontWeight:600,letterSpacing:".1em",marginBottom:7}}>⚖️ POSITION MANAGEMENT</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:7}}>
                    {intelP2.positionManagement.maxRiskPerTrade&&<div style={{background:C.bg2,borderRadius:7,padding:"7px 9px",border:"1px solid "+C.border}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.txt3,marginBottom:1}}>MAX RISK/TRADE</div>
                      <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,fontWeight:700,color:C.up}}>{intelP2.positionManagement.maxRiskPerTrade.split(" ")[0]}</div>
                    </div>}
                    {intelP2.positionManagement.stopDistance&&<div style={{background:C.bg2,borderRadius:7,padding:"7px 9px",border:"1px solid "+C.border}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.txt3,marginBottom:1}}>MIN STOP</div>
                      <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,fontWeight:700,color:C.amber}}>{intelP2.positionManagement.stopDistance}</div>
                    </div>}
                  </div>
                  {[intelP2.positionManagement.newsRule,intelP2.positionManagement.note].filter(Boolean).map(function(t:string,i:number){
                    return <div key={i} style={{display:"flex",gap:6,marginBottom:4}}>
                      <span style={{color:C.up,fontSize:11,flexShrink:0}}>→</span>
                      <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt0,lineHeight:1.65}}>{t}</span>
                    </div>;
                  })}
                </div>}

                {/* Instruments */}
                {intelP2.instruments&&intelP2.instruments.length>0&&<div style={{marginBottom:8}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:7}}>📊 INSTRUMENT FOCUS</div>
                  {intelP2.instruments.map(function(inst:any,i:number){
                    return <div key={i} style={{background:C.bg1,border:"1px solid "+(inst.color||C.border)+"33",borderRadius:10,padding:"12px",marginBottom:7}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
                            <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:14,fontWeight:700,color:C.txt0}}>{inst.name}</span>
                            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:4,color:inst.color||C.txt2,background:(inst.color||C.txt2)+"18",border:"1px solid "+(inst.color||C.txt2)+"33"}}>{inst.bias}</span>
                          </div>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.txt3}}>Conviction: <span style={{color:inst.color||C.txt2}}>{inst.conviction}</span></span>
                        </div>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:15,fontWeight:600,color:C.txt0}}>{inst.price}</span>
                      </div>
                      <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt1,lineHeight:1.75,marginBottom:8}}>{inst.summary}</div>
                      {inst.levels&&<div style={{display:"flex",gap:4,marginBottom:8}}>
                        {[["S2",inst.levels.s2,C.up,true],["S1",inst.levels.s1,C.up,false],["NOW",inst.levels.now,inst.color||C.txt0,false],["R1",inst.levels.r1,C.dn,false],["R2",inst.levels.r2,C.dn,true]].map(function(row:any){
                          var l=row[0];var v=row[1];var c=row[2];var b=row[3];
                          if(!v)return null;
                          return <div key={l} style={{flex:1,background:C.bg2,border:"1px solid "+(b?c:c+"44"),borderRadius:5,padding:"4px 2px",textAlign:"center"}}>
                            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7,color:C.txt3,marginBottom:1}}>{l}</div>
                            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:b?700:400,color:c}}>{v}</div>
                          </div>;
                        })}
                      </div>}
                      {inst.setup&&<div style={{background:(inst.color||C.blue)+"0d",border:"1px solid "+(inst.color||C.blue)+"22",borderRadius:6,padding:"7px 10px"}}>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:inst.color||C.blue,fontWeight:600}}>SETUP: </span>
                        <span style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:11,color:C.txt0}}>{inst.setup}</span>
                      </div>}
                    </div>;
                  })}
                </div>}

                {/* Watchlist */}
                {intelP2.watchlist&&intelP2.watchlist.length>0&&<div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"12px",marginBottom:8}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:8}}>👁 WATCHLIST TONIGHT</div>
                  {intelP2.watchlist.map(function(w:any,i:number){
                    var pc=w.priority==="CRITICAL"?"#ff1840":w.priority==="HIGH"?C.dn:C.amber;
                    return <div key={i} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"9px 11px",marginBottom:i<intelP2.watchlist.length-1?5:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,color:C.txt0}}>{w.symbol}</span>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:4,color:w.color||C.txt2,background:(w.color||C.txt2)+"18",border:"1px solid "+(w.color||C.txt2)+"33"}}>{w.bias}</span>
                          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,fontWeight:700,padding:"1px 5px",borderRadius:3,color:pc,background:pc+"18"}}>{w.priority}</span>
                        </div>
                        {w.price&&<span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:600,color:C.txt0}}>{w.price}</span>}
                      </div>
                      <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt1,lineHeight:1.5}}>{w.note}</div>
                    </div>;
                  })}
                </div>}

                {/* Trade Focus */}
                {intelP2.tradeFocus&&<div style={{background:"linear-gradient(135deg,rgba(34,212,110,0.07),rgba(34,212,110,0.02))",border:"1px solid rgba(34,212,110,0.22)",borderRadius:10,padding:"13px",marginBottom:8}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.up,letterSpacing:".1em",fontWeight:600,marginBottom:7}}>🎯 TRADE FOCUS — TONIGHT</div>
                  <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,color:C.txt0,lineHeight:1.85}}>{intelP2.tradeFocus}</div>
                </div>}

                {/* Regen button */}
                <div style={{display:"flex",justifyContent:"center",paddingTop:4}}>
                  <button className="tap" onClick={function(){if(window.confirm("Regenerate Intel report for this session?"))fetchIntel(intelSession,true);}}
                    style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:7,padding:"6px 14px",fontFamily:"'IBM Plex Mono',monospace",color:C.txt2,fontSize:9}}>
                    ↻ Regenerate
                  </button>
                </div>
              </div>
            )}
          {/* INTEL REPORT COMPLETE */}
          {intelPhase==="complete"&&intelP2&&(
            <div style={{margin:"4px 12px 12px",animation:"fadeUp 0.55s ease forwards",opacity:0,
              background:"linear-gradient(135deg,rgba(34,212,110,0.1),rgba(34,212,110,0.03))",
              border:"1px solid rgba(34,212,110,0.3)",borderRadius:12,padding:"14px 16px",
              display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:34,height:34,borderRadius:"50%",flexShrink:0,
                background:"rgba(34,212,110,0.12)",border:"1px solid rgba(34,212,110,0.28)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>✓</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:700,
                  color:C.up,letterSpacing:".1em",marginBottom:2}}>INTEL REPORT COMPLETE</div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:C.txt2}}>
                  {intelP1&&intelP1.generatedAt?intelP1.generatedAt+" · ":""}{intelP1&&intelP1.validFor||""}
                </div>
              </div>
              <button onClick={function(){setIntelPhase("idle");setIntelP1(null);setIntelP2(null);setIntelP1Progress(0);setIntelP2Progress(0);}}
                style={{background:C.bg2,border:"1px solid "+C.border,color:C.txt2,borderRadius:8,
                  padding:"5px 11px",fontSize:9,cursor:"pointer",
                  fontFamily:"'IBM Plex Mono',monospace",letterSpacing:".06em",flexShrink:0}}>
                ↻ RESET
              </button>
            </div>
          )}
          </div>
        )}
                {tab==="filter"&&<div style={{padding:"12px"}}>
          {/* Agentic prompt buttons */}
          <div style={{marginBottom:8}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",fontWeight:600,marginBottom:6}}>QUICK ANALYSIS</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
              {[
                {label:"🌍 Geopolitical Risk",prompt:"Analyze current geopolitical risks affecting Gold, Oil and JPY. Include Middle East tensions, Russia-Ukraine, and any active flashpoints."},
                {label:"🏛 Fed Policy Impact",prompt:"Analyze the current Federal Reserve policy stance and how rate cut expectations are affecting Gold, DXY and US equities right now."},
                {label:"🇯🇵 JPY Carry Trade",prompt:"Analyze JPY carry trade risk right now. Is USD/JPY near intervention zone? What is the carry unwind risk and how does it affect Gold?"},
                {label:"📊 Gold Drivers",prompt:"What are the key drivers moving Gold right now? Analyze DXY correlation, real yields, central bank demand, and institutional positioning."},
                {label:"⚡ Risk-On/Off Regime",prompt:"What is the current market risk regime? Is it risk-on or risk-off? What instruments are confirming it and what should traders focus on?"},
                {label:"💵 DXY Analysis",prompt:"Analyze DXY current trend, key levels, and what it means for Gold, EUR/USD and commodity prices. Is the dollar bullish or bearish?"},
              ].map(function(p,i){
                return <button key={i} className="tap" onClick={function(){setHl(p.prompt);analyze(p.prompt);}}
                  style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:"9px 10px",
                    textAlign:"left",color:C.txt1,fontSize:11,lineHeight:1.4,fontFamily:"inherit"}}>
                  {p.label}
                </button>;
              })}
            </div>
          </div>
          <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:"13px",marginBottom:10}}>
            <div style={{fontSize:10,color:C.txt2,letterSpacing:".12em",marginBottom:4}}>OR TYPE / PASTE A HEADLINE</div>
            <div style={{fontSize:10,color:C.txt3,marginBottom:8,opacity:0.7}}>AI analyzes market transmission chain + money flow + scenarios</div>
            <textarea value={hl} onChange={function(e){setHl(e.target.value);}}
              placeholder="e.g. Iran closes Strait of Hormuz following US airstrike…"
              rows={3} style={{width:"100%",background:"transparent",border:"none",color:C.txt0,fontSize:13,resize:"none",lineHeight:1.7,fontFamily:"inherit"}}/>
            <div style={{borderTop:"1px solid "+C.border,marginTop:10,paddingTop:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <div>
                  <div style={{fontSize:9,color:C.gold,letterSpacing:".1em",fontWeight:600}}>◈ EDGEFINDER DATA <span style={{color:C.txt3,fontWeight:400}}>(optional)</span></div>
                  <div style={{fontSize:9,color:C.txt3,marginTop:1}}>Upload screenshots — COT, Top Setups, positioning data</div>
                </div>
                <label htmlFor="edge-upload" style={{background:C.bg2,border:"1px solid rgba(200,168,64,0.3)",color:C.goldL,borderRadius:7,padding:"5px 10px",fontSize:9,cursor:"pointer",fontFamily:"inherit",letterSpacing:".05em"}}>+ ADD IMAGES</label>
                <input id="edge-upload" type="file" accept="image/*" multiple onChange={handleEdgeUpload} style={{display:"none"}}/>
              </div>
              {edgeImages.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
                {edgeImages.map(function(img,i){
                  return <div key={i} style={{position:"relative",borderRadius:6,overflow:"hidden",border:"1px solid rgba(200,168,64,0.3)"}}>
                    <img src={"data:"+img.mediaType+";base64,"+img.base64} style={{height:60,width:"auto",display:"block"}}/>
                    <button onClick={function(){setEdgeImages(function(p){return p.filter(function(_,j){return j!==i;});});}}
                      style={{position:"absolute",top:2,right:2,background:"rgba(0,0,0,0.7)",border:"none",color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>×</button>
                    <div style={{background:"rgba(0,0,0,0.6)",position:"absolute",bottom:0,left:0,right:0,fontSize:7,color:C.txt2,padding:"1px 4px",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{img.name}</div>
                  </div>;
                })}
                {edgeImages.length<3&&<label htmlFor="edge-upload" style={{height:60,width:48,background:C.bg2,border:"1px dashed "+C.border2,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.txt3,fontSize:18}}>+</label>}
              </div>}
              {edgeImages.length>0&&<div style={{marginTop:6,background:"rgba(200,168,64,0.07)",border:"1px solid rgba(200,168,64,0.2)",borderRadius:6,padding:"6px 9px",fontSize:9,color:C.goldL}}>
                ✓ {edgeImages.length} EdgeFinder screenshot{edgeImages.length>1?"s":""} attached — AI will cross-analyze against news event
              </div>}
            </div>
            <button onClick={function(){analyze(undefined);}} disabled={loading||!hl.trim()}
              style={{width:"100%",marginTop:10,background:loading?C.bg2:C.gold,color:loading?C.txt2:"#0c1118",border:"none",borderRadius:8,padding:"11px",fontSize:11,fontWeight:500,letterSpacing:".1em",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
              {loading?[<div key="sp" className="sp" style={{width:12,height:12,border:"2px solid "+C.border2,borderTopColor:C.txt1,borderRadius:"50%"}}></div>,"ANALYZING…"]:[edgeImages.length>0?"◈ ":"▶  ",edgeImages.length>0?"ANALYZE + CROSS-CHECK EDGEFINDER":"ANALYZE IMPACT"]}
            </button>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.txt2,letterSpacing:".1em",marginBottom:5}}>QUICK SAMPLES</div>
            {SAMPLES.map(function(s,i){
              return <button key={i} className="tap" onClick={function(){setHl(s);analyze(s);}}
                style={{display:"block",width:"100%",background:C.bg1,border:"1px solid "+C.border,color:C.txt1,borderRadius:8,padding:"9px 12px",fontSize:11,textAlign:"left",marginBottom:4}}>{s}</button>;
            })}
          </div>
          {err&&<div style={{background:"rgba(240,64,64,0.07)",border:"1px solid rgba(240,64,64,0.2)",borderRadius:8,padding:"10px 12px",color:C.dn,fontSize:12,marginBottom:10}}>⚠ {err}</div>}
          {result&&cfg&&<div className="fu" style={{background:cfg.bg,border:"1px solid "+cfg.color+"28",borderRadius:12,padding:"14px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:11,flexWrap:"wrap",gap:6}}>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,color:cfg.color,letterSpacing:".06em"}}>{result.impactLevel}</div>
                <div style={{display:"flex",gap:6,marginTop:3,flexWrap:"wrap"}}>
                  <span style={{fontSize:10,color:SC[result.marketSentiment as keyof typeof SC]||C.txt1,fontWeight:500}}>{result.marketSentiment}</span>
                  <span style={{fontSize:10,color:C.txt3}}>·</span>
                  <span style={{fontSize:10,color:DC[result.sentimentShift as keyof typeof DC]||C.txt1,fontWeight:500}}>{result.sentimentShift}</span>
                  <span style={{fontSize:10,color:C.txt3}}>·</span>
                  <span style={{fontSize:10,color:C.txt1}}>{result.timeHorizon}</span>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:8,color:C.txt3,letterSpacing:".1em",marginBottom:3}}>IMPACT</div>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:70,height:4,background:C.bg2,borderRadius:2,overflow:"hidden"}}>
                    <div style={{width:result.impactScore+"%",height:"100%",background:cfg.bar,borderRadius:2}}></div>
                  </div>
                  <span style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,color:cfg.color}}>{result.impactScore}</span>
                </div>
              </div>
            </div>
            {result.immediateImpact&&<div style={{background:"rgba(72,144,248,0.07)",border:"1px solid rgba(72,144,248,0.2)",borderRadius:8,padding:"10px 12px",marginBottom:8}}>
              <div style={{fontSize:9,color:C.blue,letterSpacing:".1em",marginBottom:4}}>⚡ IMMEDIATE IMPACT</div>
              <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,color:C.txt0,lineHeight:1.8}}>{result.immediateImpact}</div>
            </div>}
            {result.moneyFlow&&<div style={{background:"rgba(200,168,64,0.07)",border:"1px solid rgba(200,168,64,0.2)",borderRadius:8,padding:"10px 12px",marginBottom:8}}>
              <div style={{fontSize:9,color:C.gold,letterSpacing:".1em",marginBottom:4}}>💰 MONEY FLOW</div>
              <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,color:C.txt0,lineHeight:1.8}}>{result.moneyFlow}</div>
            </div>}
            {result.geopoliticalCascade&&<div style={{background:"rgba(184,88,240,0.07)",border:"1px solid rgba(184,88,240,0.2)",borderRadius:8,padding:"10px 12px",marginBottom:8}}>
              <div style={{fontSize:9,color:C.vix,letterSpacing:".1em",marginBottom:4}}>🌐 TRANSMISSION CHAIN</div>
              <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,color:C.txt0,lineHeight:1.8}}>{result.geopoliticalCascade}</div>
            </div>}
            {result.edgeFinderOverride&&result.edgeFinderOverride.triggered&&<div style={{background:"rgba(240,64,64,0.08)",border:"1px solid rgba(240,64,64,0.3)",borderRadius:8,padding:"10px 12px",marginBottom:8}}>
              <div style={{fontSize:9,color:C.dn,letterSpacing:".1em",marginBottom:4}}>⚠ EDGEFINDER OVERRIDE ALERT</div>
              <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:13,color:C.txt0,lineHeight:1.8}}>{result.edgeFinderOverride.reason}</div>
            </div>}
            {result.edgeFinderCrossCheck&&result.edgeFinderCrossCheck.hasData&&<div style={{background:"rgba(200,168,64,0.08)",border:"2px solid rgba(200,168,64,0.35)",borderRadius:10,padding:"12px",marginBottom:8}}>
              <div style={{fontSize:10,color:C.goldL,letterSpacing:".1em",fontWeight:700,marginBottom:8}}>◈ EDGEFINDER CROSS-ANALYSIS</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                <div style={{background:"rgba(0,0,0,0.25)",borderRadius:7,padding:"8px 10px",border:"1px solid "+(result.edgeFinderCrossCheck.cotAlignment==="CONTRADICTS"?"rgba(240,64,64,0.3)":result.edgeFinderCrossCheck.cotAlignment==="CONFIRMS"?"rgba(40,204,120,0.3)":"rgba(240,144,32,0.3)")}}>
                  <div style={{fontSize:8,color:C.txt3,letterSpacing:".1em",marginBottom:3}}>COT DATA</div>
                  <div style={{fontSize:11,fontWeight:700,color:result.edgeFinderCrossCheck.cotAlignment==="CONTRADICTS"?C.dn:result.edgeFinderCrossCheck.cotAlignment==="CONFIRMS"?C.up:C.amber,marginBottom:3}}>{result.edgeFinderCrossCheck.cotAlignment}</div>
                  <div style={{fontSize:10,color:C.txt1,lineHeight:1.5}}>{result.edgeFinderCrossCheck.cotNote}</div>
                </div>
                <div style={{background:"rgba(0,0,0,0.25)",borderRadius:7,padding:"8px 10px",border:"1px solid "+(result.edgeFinderCrossCheck.setupAlignment==="CONTRADICTS"?"rgba(240,64,64,0.3)":result.edgeFinderCrossCheck.setupAlignment==="CONFIRMS"?"rgba(40,204,120,0.3)":"rgba(240,144,32,0.3)")}}>
                  <div style={{fontSize:8,color:C.txt3,letterSpacing:".1em",marginBottom:3}}>TOP SETUPS</div>
                  <div style={{fontSize:11,fontWeight:700,color:result.edgeFinderCrossCheck.setupAlignment==="CONTRADICTS"?C.dn:result.edgeFinderCrossCheck.setupAlignment==="CONFIRMS"?C.up:C.amber,marginBottom:3}}>{result.edgeFinderCrossCheck.setupAlignment}</div>
                  <div style={{fontSize:10,color:C.txt1,lineHeight:1.5}}>{result.edgeFinderCrossCheck.setupNote}</div>
                </div>
              </div>
              {result.edgeFinderCrossCheck.keyContradiction&&<div style={{background:"rgba(240,64,64,0.07)",border:"1px solid rgba(240,64,64,0.2)",borderRadius:7,padding:"8px 10px",marginBottom:6}}>
                <div style={{fontSize:8,color:C.dn,letterSpacing:".1em",marginBottom:3}}>⚡ KEY CONTRADICTION</div>
                <div style={{fontSize:11,color:C.txt0,lineHeight:1.5}}>{result.edgeFinderCrossCheck.keyContradiction}</div>
              </div>}
              {result.edgeFinderCrossCheck.resolution&&<div style={{background:"rgba(72,144,248,0.07)",border:"1px solid rgba(72,144,248,0.2)",borderRadius:7,padding:"8px 10px",marginBottom:6}}>
                <div style={{fontSize:8,color:C.blue,letterSpacing:".1em",marginBottom:3}}>HOW TO RECONCILE</div>
                <div style={{fontSize:11,color:C.txt0,lineHeight:1.5}}>{result.edgeFinderCrossCheck.resolution}</div>
              </div>}
              {result.edgeFinderCrossCheck.tradeVerdict&&<div style={{background:"rgba(200,168,64,0.1)",border:"1px solid rgba(200,168,64,0.3)",borderRadius:7,padding:"8px 10px"}}>
                <div style={{fontSize:8,color:C.gold,letterSpacing:".1em",marginBottom:3}}>TRADE VERDICT</div>
                <div style={{fontSize:12,fontWeight:600,color:C.goldL}}>{result.edgeFinderCrossCheck.tradeVerdict}</div>
              </div>}
            </div>}
            {result.keyDrivers&&result.keyDrivers.length>0&&<div style={{marginBottom:8}}>
              <div style={{fontSize:9,color:C.txt2,letterSpacing:".1em",marginBottom:4}}>KEY DRIVERS</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                {result.keyDrivers.map(function(d:string,i:number){return <span key={i} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:5,padding:"2px 7px",fontSize:10,color:C.txt1}}>{d}</span>;})}
              </div>
            </div>}
            {result.affectedInstruments&&result.affectedInstruments.length>0&&<div style={{marginBottom:8}}>
              <div style={{fontSize:9,color:C.txt2,letterSpacing:".1em",marginBottom:5}}>AFFECTED INSTRUMENTS</div>
              <div style={{display:"grid",gap:4}}>
                {result.affectedInstruments.map(function(inst:any,i:number){
                  var live=mkt.find(function(d){return d.s===inst.symbol||d.l===inst.symbol;});
                  return <div key={i} style={{background:"rgba(12,17,24,0.6)",border:"1px solid "+C.border,borderRadius:8,padding:"8px 11px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <div><span style={{fontSize:12,fontWeight:500,color:C.txt0}}>{inst.symbol}</span><span style={{marginLeft:6,fontSize:11,fontWeight:500,color:DC[inst.direction as keyof typeof DC]||C.txt2}}>{inst.direction}</span></div>
                      <div style={{textAlign:"right"}}>
                        {live&&<div style={{fontSize:10,color:live.pct>=0?C.up:C.dn}}>{fmt(live.cur,live.b)}</div>}
                        {inst.targetLevel&&<div style={{fontSize:9,color:C.txt2}}>→ {inst.targetLevel}</div>}
                        <div style={{fontSize:9,color:C.txt2}}>{inst.confidence}%</div>
                      </div>
                    </div>
                    <div style={{width:"100%",height:2,background:C.bg2,borderRadius:1,overflow:"hidden",marginBottom:4}}>
                      <div style={{width:inst.confidence+"%",height:"100%",background:DC[inst.direction as keyof typeof DC]||C.txt2,borderRadius:1}}></div>
                    </div>
                    <div style={{fontSize:11,color:C.txt1}}>{inst.reason}</div>
                  </div>;
                })}
              </div>
            </div>}
            {result.scenarios&&result.scenarios.length>0&&<div style={{marginBottom:8}}>
              <div style={{fontSize:9,color:C.txt2,letterSpacing:".1em",marginBottom:6}}>SCENARIOS</div>
              <div style={{display:"grid",gap:5}}>
                {result.scenarios.map(function(sc:any,i:number){
                  var scClr=sc.type==="BEARISH_EXTREME"?C.dn:sc.type==="BASE_CASE"?C.amber:C.up;
                  var scBg=sc.type==="BEARISH_EXTREME"?"rgba(240,64,64,0.07)":sc.type==="BASE_CASE"?"rgba(240,144,32,0.07)":"rgba(40,204,120,0.07)";
                  return <div key={i} style={{background:scBg,border:"1px solid "+scClr+"33",borderRadius:8,padding:"10px 12px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                      <div>
                        <span style={{fontSize:10,fontWeight:600,color:scClr}}>{sc.type==="BEARISH_EXTREME"?"▼ WORST":sc.type==="BASE_CASE"?"◆ BASE":"▲ BEST"}</span>
                        <span style={{marginLeft:7,fontSize:11,color:C.txt0,fontWeight:500}}>{sc.title}</span>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:11,fontWeight:600,color:scClr}}>{sc.probability}%</div>
                        {sc.timeline&&<div style={{fontSize:9,color:C.txt3}}>{sc.timeline}</div>}
                      </div>
                    </div>
                    <div style={{fontSize:11,color:C.txt0,lineHeight:1.65,marginBottom:5}}>{sc.description}</div>
                    {sc.instruments&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:4}}>
                      {sc.instruments.map(function(inst:any,j:number){
                        return <span key={j} style={{background:"rgba(0,0,0,0.25)",border:"1px solid "+C.border,borderRadius:4,padding:"2px 8px",fontSize:9,color:C.txt1}}>
                          <span style={{color:scClr}}>{inst.symbol}</span> {inst.move}
                        </span>;
                      })}
                    </div>}
                    <div style={{fontSize:10,color:C.txt2}}>👁 {sc.watchFor}</div>
                  </div>;
                })}
              </div>
            </div>}
            {result.keyLevelsToWatch&&result.keyLevelsToWatch.length>0&&<div style={{marginBottom:8}}>
              <div style={{fontSize:9,color:C.txt2,letterSpacing:".1em",marginBottom:5}}>KEY LEVELS</div>
              {result.keyLevelsToWatch.map(function(kl:any,i:number){
                return <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,background:"rgba(12,17,24,0.5)",border:"1px solid "+C.border,borderRadius:7,padding:"7px 10px"}}>
                  <span style={{fontSize:11,fontWeight:600,color:C.txt0,minWidth:60}}>{kl.symbol}</span>
                  <span style={{fontSize:12,fontWeight:600,color:C.goldL,minWidth:55}}>{kl.level}</span>
                  <span style={{flex:1,fontSize:10,color:C.txt1}}>{kl.significance}</span>
                </div>;
              })}
            </div>}
            {result.nextCatalysts&&result.nextCatalysts.length>0&&<div style={{marginBottom:8}}>
              <div style={{fontSize:9,color:C.txt2,letterSpacing:".1em",marginBottom:5}}>NEXT CATALYSTS</div>
              {result.nextCatalysts.map(function(cat:string,i:number){
                return <div key={i} style={{display:"flex",alignItems:"flex-start",gap:7,marginBottom:4,background:"rgba(12,17,24,0.4)",border:"1px solid "+C.border,borderRadius:6,padding:"7px 10px"}}>
                  <span style={{color:C.amber,fontSize:11,flexShrink:0}}>→</span>
                  <span style={{fontSize:11,color:C.txt0}}>{cat}</span>
                </div>;
              })}
            </div>}
            <div style={{background:"rgba(12,17,24,0.5)",border:"1px solid "+C.border,borderRadius:8,padding:"10px 12px"}}>
              <div style={{fontSize:9,color:C.gold,letterSpacing:".1em",marginBottom:3,opacity:0.8}}>◈ TRADER NOTE</div>
              <div style={{fontSize:12,color:C.txt0,lineHeight:1.8}}>{result.traderNote}</div>
            </div>
          </div>}
          {!result&&!loading&&<div style={{textAlign:"center",padding:"44px 20px"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,color:C.txt3,marginBottom:6,opacity:0.28}}>◈</div>
            <div style={{fontSize:11,color:C.txt3,letterSpacing:".1em"}}>PASTE A HEADLINE TO BEGIN</div>
          </div>}
        </div>}

        {/* ── AX RISK ── */}
        {tab==="axrisk"&&<div style={{padding:"12px"}} className="fu">
          <div style={{textAlign:"center",padding:"40px 20px",background:C.bg1,border:"1px solid "+C.border,borderRadius:12}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.txt3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,color:C.txt0,letterSpacing:".02em",marginBottom:8}}>AX Risk</div>
            <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt2,lineHeight:1.7,marginBottom:16}}>Intelligent position sizing and per-trade probability scoring</div>
            <div style={{display:"inline-block",fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"#4a9eff",background:"rgba(74,158,255,0.1)",border:"1px solid rgba(74,158,255,0.25)",borderRadius:4,padding:"3px 10px",letterSpacing:".1em"}}>IN DEVELOPMENT</div>
          </div>
        </div>}

        {/* ── TRADE JOURNAL ── */}
        {tab==="journal"&&<div style={{padding:"12px"}} className="fu">
          <div style={{textAlign:"center",padding:"40px 20px",background:C.bg1,border:"1px solid "+C.border,borderRadius:12}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.txt3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,color:C.txt0,letterSpacing:".02em",marginBottom:8}}>Trade Journal</div>
            <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt2,lineHeight:1.7,marginBottom:16}}>Log and review every trade with AI pattern analysis</div>
            <div style={{display:"inline-block",fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"#4a9eff",background:"rgba(74,158,255,0.1)",border:"1px solid rgba(74,158,255,0.25)",borderRadius:4,padding:"3px 10px",letterSpacing:".1em"}}>IN DEVELOPMENT</div>
          </div>
        </div>}

        {/* ── PLAYBOOK AX ── */}
        {tab==="playbook"&&<div style={{padding:"12px"}} className="fu">
          <div style={{textAlign:"center",padding:"40px 20px",background:C.bg1,border:"1px solid "+C.border,borderRadius:12}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.txt3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,color:C.txt0,letterSpacing:".02em",marginBottom:8}}>Playbook AX</div>
            <div style={{fontFamily:"'IBM Plex Sans',sans-serif",fontSize:12,color:C.txt2,lineHeight:1.7,marginBottom:16}}>Your personal high-probability setup frameworks</div>
            <div style={{display:"inline-block",fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"#4a9eff",background:"rgba(74,158,255,0.1)",border:"1px solid rgba(74,158,255,0.25)",borderRadius:4,padding:"3px 10px",letterSpacing:".1em"}}>IN DEVELOPMENT</div>
          </div>
        </div>}

        </div>
      </div>

      {/* INSTRUMENT DETAIL — streaming news + analysis */}
      {instDetail&&(function(){
        var m=instDetail;
        var up=m.pct>=0;
        var isBond=m.cat==="Bonds";
        var tfs=["1H","4H","1D","1W","1M","3M"];
        var tPts=[24,60,48,168,360,720];
        var tfSeed=m.s.split("").reduce(function(a:number,cv:string){return a+cv.charCodeAt(0);},0)+instTf*1000;
        var chartData=samplePts(instTf===2?m.ch:genFB(m.b,m.v,tPts[instTf],tfSeed),30);
        var nd=instNewsData, ad=instAnalysisData;
        // Computed indicators
        var roroScoreV=calcROROScore(mkt);
        var fg=calcFearGreed(mkt);
        var fgColor=fg<30?"#ff4d4d":fg<50?"#f0a020":fg<70?"#e8d5a3":"#00d084";
        var fgLabel=fg<20?"EXTREME FEAR":fg<40?"FEAR":fg<60?"NEUTRAL":fg<80?"GREED":"EXTREME GREED";
        var dxyInst=mkt.find(function(x:any){return x.s==="DX";});
        var corr=m.s==="DX"?1:dxyInst?calcCorrelation(m.ch,dxyInst.ch):0;
        var corrColor=Math.abs(corr)>0.5?"#e8d5a3":Math.abs(corr)>0.25?"#8892a4":"#5a6478";
        var corrNote=m.s==="DX"?"This IS DXY — self-referential":
          corr>0.5?"Strong positive — tends to move WITH DXY":
          corr>0.2?"Mild positive correlation with DXY":
          corr<-0.5?"Strong inverse — typically moves OPPOSITE DXY":
          corr<-0.2?"Mild inverse correlation with DXY":
          "Low / uncorrelated with DXY";
        var us10yInst=mkt.find(function(x:any){return x.s==="US10Y";});
        var realYield:number|null=us10yInst?parseFloat((us10yInst.cur-3.0).toFixed(2)):null;
        var ryColor=realYield===null?"#5a6478":realYield>1?"#ff4d4d":realYield>0?"#f0a020":realYield>-1?"#e8d5a3":"#00d084";
        var ryNote=realYield===null?"US 10Y data unavailable":
          realYield>2?"Deeply positive — headwind for Gold, dollar bullish":
          realYield>0.5?"Positive real yield — mild USD support":
          realYield>-0.5?"Near zero — neutral for risk assets":
          realYield>-2?"Negative real yield — bullish for Gold":
          "Deeply negative — strong inflation hedge demand";
        var instRoroClass=m.roro;
        var sessionBiasLabel:string,sessionBiasColor:string,sessionBiasNote:string;
        if(instRoroClass==="ON"){
          if(roroScoreV>=58){sessionBiasLabel="BULLISH";sessionBiasColor="#00d084";sessionBiasNote="Risk-on regime supports "+m.l;}
          else if(roroScoreV<=42){sessionBiasLabel="BEARISH";sessionBiasColor="#ff4d4d";sessionBiasNote="Risk-off headwind for "+m.l;}
          else{sessionBiasLabel="NEUTRAL";sessionBiasColor="#e8d5a3";sessionBiasNote="Mixed regime signals";}
        }else if(instRoroClass==="OFF"){
          if(roroScoreV<=42){sessionBiasLabel="BULLISH";sessionBiasColor="#00d084";sessionBiasNote="Risk-off regime supports "+m.l;}
          else if(roroScoreV>=58){sessionBiasLabel="BEARISH";sessionBiasColor="#ff4d4d";sessionBiasNote="Risk-on weighs on "+m.l;}
          else{sessionBiasLabel="NEUTRAL";sessionBiasColor="#e8d5a3";sessionBiasNote="Mixed regime signals";}
        }else{
          sessionBiasLabel=up?"BULLISH":m.pct<-0.1?"BEARISH":"NEUTRAL";
          sessionBiasColor=up?"#00d084":m.pct<-0.1?"#ff4d4d":"#e8d5a3";
          sessionBiasNote="Based on price action";
        }
        var volProf=calcVolProfile(chartData);
        var keyLvls=calcKeyLevels(chartData,m.cur);
        var cs:any={background:"#0d1220",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,padding:"11px"};
        var lb:any={fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"#5a6478",letterSpacing:".12em",marginBottom:7,fontWeight:600};
        function PBar(props:{pct:number,done:boolean}){
          return <div style={{height:3,background:"#060c14",borderRadius:2,overflow:"hidden",marginBottom:10}}>
            <div style={{height:"100%",width:props.pct+"%",
              background:props.done?"linear-gradient(90deg,"+C.up+",#45ffaa)":"linear-gradient(90deg,"+C.gold+","+C.goldL+")",
              transition:"width .4s ease,background .5s ease",
              boxShadow:props.done?"0 0 10px "+C.up:"0 0 8px "+C.gold}}/>
          </div>;
        }
        function GBar(props:{label:string}){
          return <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,
            padding:"10px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div className="sp" style={{width:12,height:12,border:"2px solid "+C.border2,borderTopColor:C.gold,borderRadius:"50%",flexShrink:0}}/>
            <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:C.gold,letterSpacing:".12em",fontWeight:600}}>{props.label}</span>
            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:C.up,animation:"pd 1.1s ease infinite"}}/>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:C.up}}>LIVE</span>
            </div>
          </div>;
        }
        function Skel(props:{h?:number}){
          return <div style={{height:props.h||70,borderRadius:8,marginBottom:6,
            background:"linear-gradient(90deg,#121d2c 25%,#1a2840 50%,#121d2c 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}}/>;
        }
        return <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,
          background:"#070b14",zIndex:600,display:"flex",flexDirection:"column",
          overflowY:"auto",WebkitOverflowScrolling:"touch",
          animation:"slideUp 0.22s cubic-bezier(0.32,0.72,0,1) forwards"}}>

          {/* ── 1: HEADER ── */}
          <div style={{background:"#0d1220",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"10px 14px",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <button className="tap" onClick={function(){setInstDetail(null);}}
                style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.06)",
                  border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,padding:"5px 12px",
                  fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,color:"#8892a4",
                  letterSpacing:".08em",cursor:"pointer"}}>
                ← BACK
              </button>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"#5a6478"}}>{new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})} SGT</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"#5a6478",letterSpacing:".12em",marginBottom:4}}>{m.s} · {m.cat.toUpperCase()}</div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:26,fontWeight:700,color:"#e8d5a3",fontVariantNumeric:"tabular-nums",lineHeight:1}}>{fmt(m.cur,m.b)}{isBond?"%":""}</div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,color:up?"#00d084":"#ff4d4d"}}>{up?"▲":"▼"} {up?"+":""}{m.pct.toFixed(2)}%</span>
                  <div style={{background:sessionBiasColor+"1a",border:"1px solid "+sessionBiasColor+"40",borderRadius:4,padding:"2px 8px"}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,color:sessionBiasColor,letterSpacing:".08em"}}>{sessionBiasLabel}</span>
                  </div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"#5a6478",marginBottom:4}}>{m.l}</div>
                {m.live&&<div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"flex-end"}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:"#00d084"}} className="pd"/>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"#00d084"}}>LIVE</span>
                </div>}
              </div>
            </div>
          </div>

          {/* ── 2: TIMEFRAME + OHLC ── */}
          <div style={{background:"#070b14",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"8px 12px",flexShrink:0}}>
            <div style={{display:"flex",gap:3,marginBottom:7}}>
              {tfs.map(function(tf:string,i:number){
                return <button key={tf} className="tap" onClick={function(){setInstTf(i);}}
                  style={{flex:1,background:instTf===i?"rgba(232,213,163,0.12)":"transparent",
                    border:instTf===i?"1px solid rgba(232,213,163,0.25)":"1px solid rgba(255,255,255,0.05)",
                    borderRadius:5,padding:"5px 0",fontFamily:"'IBM Plex Mono',monospace",
                    fontSize:9,fontWeight:instTf===i?600:400,letterSpacing:".04em",
                    color:instTf===i?"#e8d5a3":"#5a6478",transition:"all .12s",cursor:"pointer"}}>
                  {tf}
                </button>;
              })}
            </div>
            <div style={{display:"flex",gap:3}}>
              {([["O",chartData[0]?.p],["H",Math.max.apply(null,chartData.map(function(d:any){return d.p;}))],
                ["L",Math.min.apply(null,chartData.map(function(d:any){return d.p;}))],["C",m.cur]] as any[]).map(function(row:any){
                return <div key={row[0]} style={{flex:1,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:5,padding:"4px 5px",textAlign:"center"}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7,color:"#5a6478",marginBottom:1}}>{row[0]}</div>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,color:"#ffffff",fontVariantNumeric:"tabular-nums"}}>{fmt(row[1],m.b)}</div>
                </div>;
              })}
            </div>
          </div>

          {/* ── 3: CHART 160px ── */}
          <div style={{background:"#0a0e1a",borderBottom:"1px solid rgba(255,255,255,0.08)",flexShrink:0}}>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData} margin={{top:6,right:8,bottom:4,left:0}}>
                <defs>
                  <linearGradient id="idcg2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(232,213,163,0.22)"/>
                    <stop offset="100%" stopColor="rgba(232,213,163,0)"/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={true} horizontal={true} strokeDasharray=""/>
                <XAxis dataKey="t" tick={{fill:"#5a6478",fontSize:9}} tickLine={false} axisLine={false} interval={Math.max(1,Math.floor(chartData.length/6))}/>
                <YAxis orientation="right" domain={["auto","auto"]} padding={{top:8,bottom:8}} tick={{fill:"#5a6478",fontSize:9}} tickLine={false} axisLine={false} width={58} tickCount={6} tickFormatter={function(v){return fmt(v,m.b);}}/>
                <Tooltip content={<ChartTip/>}/>
                <Area type="monotone" dataKey="p" stroke="#e8d5a3" strokeWidth={2} fill="url(#idcg2)" dot={false} activeDot={{r:4,fill:"#e8d5a3",strokeWidth:0}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ── Scrollable content ── */}
          <div style={{flex:1,padding:"10px 12px 80px"}}>

            {/* ── 4: 3-COL ROW — Session Bias · Fear & Greed · ETF Flow ── */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
              {/* Session Bias */}
              <div style={cs}>
                <div style={lb}>SESSION BIAS</div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:15,fontWeight:700,color:sessionBiasColor,lineHeight:1}}>{sessionBiasLabel}</div>
                <div style={{fontSize:8,color:"#5a6478",marginTop:4,lineHeight:1.4}}>{sessionBiasNote}</div>
                <div style={{height:2,background:sessionBiasColor+"18",borderRadius:1,marginTop:6,overflow:"hidden"}}>
                  <div style={{height:"100%",width:sessionBiasLabel==="BULLISH"?"75%":sessionBiasLabel==="BEARISH"?"25%":"50%",background:sessionBiasColor,borderRadius:1}}/>
                </div>
              </div>
              {/* Fear & Greed */}
              <div style={cs}>
                <div style={lb}>FEAR/GREED</div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:19,fontWeight:700,color:fgColor,lineHeight:1}}>{Math.round(fg)}</div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7,color:fgColor,letterSpacing:".04em",marginTop:3}}>{fgLabel}</div>
                <div style={{height:3,background:"#1a2a3a",borderRadius:2,marginTop:6,position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,#ff4d4d 0%,#f0a020 30%,#e8d5a3 55%,#00d084 100%)"}}/>
                  <div style={{position:"absolute",left:Math.min(98,fg)+"%",top:0,width:2,height:"100%",background:"#fff",transform:"translateX(-50%)",borderRadius:1}}/>
                </div>
              </div>
              {/* ETF Flow */}
              <div style={cs}>
                <div style={lb}>ETF FLOW</div>
                {instEtfLoading&&<div style={{fontSize:8,color:"#5a6478"}}>Loading…</div>}
                {!instEtfLoading&&instEtfFlow&&<>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"#8892a4",marginBottom:2}}>{instEtfFlow.sym}</div>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:700,color:instEtfFlow.pct>=0?"#00d084":"#ff4d4d",lineHeight:1}}>{instEtfFlow.pct>=0?"+":""}{instEtfFlow.pct.toFixed(2)}%</div>
                  {instEtfFlow.vol>0&&<div style={{fontSize:8,color:"#5a6478",marginTop:3}}>Vol: {(instEtfFlow.vol/1e6).toFixed(1)}M</div>}
                </>}
                {!instEtfLoading&&!instEtfFlow&&<div style={{fontSize:9,color:"#5a6478"}}>—</div>}
              </div>
            </div>

            {/* ── 5: 2-COL ROW — DXY Correlation · Real Yield ── */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
              <div style={cs}>
                <div style={lb}>DXY CORRELATION</div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:20,fontWeight:700,color:corrColor,lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{corr.toFixed(2)}</div>
                <div style={{fontSize:9,color:"#5a6478",marginTop:4,lineHeight:1.5}}>{corrNote}</div>
              </div>
              <div style={cs}>
                <div style={lb}>REAL YIELD 10Y</div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:20,fontWeight:700,color:ryColor,lineHeight:1,fontVariantNumeric:"tabular-nums"}}>
                  {realYield!==null?(realYield>0?"+":"")+realYield.toFixed(2)+"%":"—"}
                </div>
                <div style={{fontSize:9,color:"#5a6478",marginTop:4,lineHeight:1.5}}>{ryNote}</div>
              </div>
            </div>

            {/* ── 6: COT POSITIONING ── */}
            <div style={{...cs,marginBottom:8}}>
              <div style={lb}>COT POSITIONING · SPECULATOR (NON-COMMERCIAL)</div>
              {instCotLoading&&<div style={{fontSize:9,color:"#5a6478",padding:"6px 0"}}>Fetching CFTC data…</div>}
              {!instCotLoading&&(!instCot||instCot.error)&&<div style={{fontSize:9,color:"#5a6478",padding:"6px 0"}}>{instCot?.error||"No COT data for this instrument"}</div>}
              {instCot&&!instCot.error&&<>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:3,marginBottom:6}}>
                  {["LONG%","SHORT%","NET","WoW CHG","BIAS"].map(function(h:string){
                    return <div key={h} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7,color:"#5a6478",letterSpacing:".04em",textAlign:"center"}}>{h}</div>;
                  })}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:3,marginBottom:8}}>
                  {[
                    [instCot.longPct+"%","#00d084"],
                    [instCot.shortPct+"%","#ff4d4d"],
                    [(instCot.net>=0?"+":"")+instCot.net.toLocaleString(),instCot.net>=0?"#00d084":"#ff4d4d"],
                    [(instCot.netChg>=0?"+":"")+instCot.netChg.toLocaleString(),instCot.netChg>=0?"#00d084":"#ff4d4d"],
                    [instCot.bias,instCot.biasColor],
                  ].map(function(cell:any,i:number){
                    return <div key={i} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,fontWeight:700,color:cell[1],textAlign:"center",fontVariantNumeric:"tabular-nums"}}>{cell[0]}</div>;
                  })}
                </div>
                <div style={{marginBottom:7}}>
                  <div style={{display:"flex",height:5,borderRadius:3,overflow:"hidden",marginBottom:3}}>
                    <div style={{width:instCot.longPct+"%",background:"#00d084",transition:"width .5s ease"}}/>
                    <div style={{flex:1,background:"#ff4d4d"}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7,color:"#00d084"}}>{instCot.longs.toLocaleString()} LONG</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7,color:"#ff4d4d"}}>{instCot.shorts.toLocaleString()} SHORT</span>
                  </div>
                </div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"#5a6478",marginBottom:7}}>
                  OI: <span style={{color:"#e8d5a3"}}>{instCot.oi.toLocaleString()}</span> · Report: <span style={{color:"#8892a4"}}>{instCot.date}</span>
                </div>
                <div style={{borderLeft:"2px solid #e8d5a3",paddingLeft:8,background:"rgba(232,213,163,0.04)",borderRadius:"0 4px 4px 0",padding:"7px 8px"}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7,color:"#e8d5a3",letterSpacing:".08em",marginBottom:3}}>⬟ READING</div>
                  <div style={{fontSize:11,color:"#c2d4e8",lineHeight:1.6}}>{instCot.reading}</div>
                </div>
              </>}
            </div>

            {/* ── 7: VOLUME PROFILE + KEY LEVELS ── */}
            <div style={{...cs,marginBottom:8}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {/* Volume Profile */}
                <div>
                  <div style={lb}>VOL PROFILE</div>
                  {volProf?volProf.buckets.map(function(b:any,i:number){
                    var isPoc=Math.abs(b.mid-volProf.poc)<(volProf.mx-volProf.mn)/14;
                    var isAbove=b.mid>m.cur;
                    var bc2=isPoc?"#e8d5a3":isAbove?"#ff4d4d":"#00d084";
                    var tag=isPoc?"POC":isAbove?"R":"S";
                    return <div key={i} style={{display:"flex",alignItems:"center",gap:3,marginBottom:3}}>
                      <div style={{width:12,fontFamily:"'IBM Plex Mono',monospace",fontSize:6,color:bc2,textAlign:"right",flexShrink:0}}>{tag}</div>
                      <div style={{flex:1,height:7,background:"rgba(255,255,255,0.04)",borderRadius:1,overflow:"hidden"}}>
                        <div style={{height:"100%",width:b.pct+"%",background:bc2,opacity:0.75,borderRadius:1}}/>
                      </div>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:6,color:"#5a6478",width:36,flexShrink:0,textAlign:"right"}}>{fmt(b.mid,m.b)}</div>
                    </div>;
                  }):<div style={{fontSize:8,color:"#5a6478"}}>Insufficient data</div>}
                </div>
                {/* Key Levels */}
                <div>
                  <div style={lb}>KEY LEVELS</div>
                  {([
                    [keyLvls.r2,"R2","#ff4d4d","SUPPLY"],
                    [keyLvls.r1,"R1","#f08060","SELL"],
                    [keyLvls.cur,"NOW","#e8d5a3","HERE"],
                    [keyLvls.s1,"S1","#60d080","BUY"],
                    [keyLvls.s2,"S2","#00d084","DEMAND"],
                  ] as any[]).map(function(row:any){
                    var isNow=row[1]==="NOW";
                    return <div key={row[1]} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5,
                      background:isNow?"rgba(232,213,163,0.06)":"transparent",borderRadius:4,padding:isNow?"4px 5px":"2px 5px",
                      border:isNow?"1px solid rgba(232,213,163,0.15)":"none"}}>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:700,color:row[2],width:22}}>{row[1]}</span>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:6,color:row[2],opacity:0.6}}>{row[3]}</span>
                      </div>
                      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,fontWeight:600,color:isNow?"#e8d5a3":"#ffffff",fontVariantNumeric:"tabular-nums"}}>{fmt(row[0],m.b)}{isBond?"%":""}</span>
                    </div>;
                  })}
                </div>
              </div>
            </div>

            {/* ── 8: NEWS HEADLINES ── */}
            <div style={{...cs,marginBottom:8}}>
              <div style={{...lb,display:"flex",alignItems:"center",gap:6}}>
                NEWS HEADLINES
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7,color:"#3a5570",fontWeight:400}}>· HAIKU</span>
              </div>
              {instNewsPhase==="loading"&&<><PBar pct={instNewsProgress} done={false}/><GBar label="FETCHING NEWS..."/></>}
              {!canSpend()&&instNewsPhase!=="done"&&<div style={{fontSize:10,color:"#ff4d4d",padding:"6px 0"}}>Daily AI budget limit reached</div>}
              {nd.items&&nd.items.slice(0,3).map(function(it:any,i:number){
                return <div key={i} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",
                  borderLeft:"3px solid "+(it.sentColor||"#5a6478"),borderRadius:6,padding:"9px 10px",marginBottom:6,
                  animation:"fu .35s ease forwards",animationDelay:(i*60)+"ms",opacity:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7,color:"#5a6478"}}>{it.src} · {it.time}</span>
                    <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7,fontWeight:700,color:it.sentColor,background:(it.sentColor||"#5a6478")+"18",padding:"1px 5px",borderRadius:2}}>{it.sentiment}</span>
                  </div>
                  <div style={{fontSize:11,fontWeight:600,color:"#f0f5ff",lineHeight:1.4}}>{it.headline}</div>
                </div>;
              })}
              {instNewsPhase==="done"&&nd.items&&<button className="tap" onClick={function(){fetchInstNews(m,true);}}
                style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",
                  borderRadius:5,padding:"4px 10px",fontSize:8,color:"#5a6478",fontFamily:"'IBM Plex Mono',monospace",cursor:"pointer"}}>↻ refresh</button>}
              {instNewsPhase==="idle"&&canSpend()&&<div style={{fontSize:9,color:"#5a6478"}}>Loading…</div>}
            </div>

            {/* ── 9: AI ANALYSIS SUMMARY ── */}
            <div style={{...cs,marginBottom:8}}>
              <div style={{...lb,display:"flex",alignItems:"center",gap:6}}>
                AI ANALYSIS
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7,color:"#3a5570",fontWeight:400}}>· HAIKU · CACHED DAILY</span>
              </div>
              {instAnalysisPhase==="idle"&&canSpend()&&<button className="tap" onClick={function(){fetchInstAnalysis(m);}}
                style={{width:"100%",background:"rgba(232,213,163,0.08)",border:"1px solid rgba(232,213,163,0.2)",
                  borderRadius:7,padding:"10px",fontSize:10,fontWeight:600,color:"#e8d5a3",
                  letterSpacing:".08em",cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",marginBottom:6}}>
                ⬟ GENERATE ANALYSIS
              </button>}
              {!canSpend()&&instAnalysisPhase!=="done"&&<div style={{fontSize:10,color:"#ff4d4d",padding:"6px 0"}}>Daily AI budget limit reached</div>}
              {instAnalysisPhase==="loading"&&<><PBar pct={instAnalysisProgress} done={false}/><GBar label="GENERATING..."/></>}
              {instAnalysisPhase==="done"&&<PBar pct={100} done/>}
              {ad.bias&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,animation:"fu .4s ease forwards",opacity:0}}>
                <div style={{background:(ad.biasColor||"#e8d5a3")+"18",border:"1px solid "+(ad.biasColor||"#e8d5a3")+"44",borderRadius:6,padding:"5px 14px"}}>
                  <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:700,color:ad.biasColor||"#e8d5a3",letterSpacing:".06em"}}>{ad.bias}</span>
                </div>
              </div>}
              {ad.summary&&<div style={{fontSize:12,color:"#c2d4e8",lineHeight:1.8,marginBottom:8,animation:"fu .4s ease forwards",opacity:0}}>{ad.summary}</div>}
              {ad.setup&&<div style={{background:"rgba(34,212,110,.05)",border:"1px solid rgba(34,212,110,.15)",borderRadius:6,padding:"8px 10px",marginBottom:6,animation:"fu .4s ease forwards",opacity:0}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7,color:"#22d46e",letterSpacing:".1em",marginBottom:4}}>TRADE SETUP</div>
                <div style={{fontSize:11,color:"#c2d4e8",lineHeight:1.65}}>{ad.setup}</div>
              </div>}
              {ad.risk&&<div style={{background:"rgba(240,69,69,.05)",border:"1px solid rgba(240,69,69,.15)",borderRadius:6,padding:"8px 10px",marginBottom:6,animation:"fu .4s ease forwards",opacity:0}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:7,color:"#f04545",letterSpacing:".1em",marginBottom:4}}>RISK</div>
                <div style={{fontSize:11,color:"#c2d4e8",lineHeight:1.65}}>{ad.risk}</div>
              </div>}
              {instAnalysisPhase==="done"&&ad.summary&&<button className="tap" onClick={function(){setInstAnalysisPhase("idle");setInstAnalysisData({});}}
                style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:5,padding:"4px 10px",fontSize:8,color:"#5a6478",fontFamily:"'IBM Plex Mono',monospace",cursor:"pointer"}}>↻ refresh</button>}
            </div>

          </div>
        </div>;
      }())}
        {/* ── NEWS FEED ── */}
        {tab==="news"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",padding:"40px 24px",textAlign:"center",gap:16}}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4a9eff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
            <line x1="12" y1="7" x2="18" y2="7"/><line x1="12" y1="11" x2="18" y2="11"/><line x1="12" y1="15" x2="16" y2="15"/>
          </svg>
          <div style={{fontSize:20,fontWeight:500,color:"#ffffff",fontFamily:"'IBM Plex Sans',sans-serif"}}>News Feed</div>
          <div style={{fontSize:14,color:"#7a9ab8",fontFamily:"'IBM Plex Sans',sans-serif",maxWidth:300,lineHeight:1.6}}>AI-tagged live news with BULL/BEAR sentiment. Requires Polygon.io API — coming in Pro tier.</div>
          <div style={{fontSize:10,color:"#4a9eff",background:"rgba(74,158,255,0.12)",padding:"4px 12px",borderRadius:4,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:".08em"}}>PRO FEATURE · COMING SOON</div>
        </div>}

        {/* ── ECONOMIC CALENDAR ── */}
        {tab==="calendar"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",padding:"40px 24px",textAlign:"center",gap:16}}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4a9eff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
          </svg>
          <div style={{fontSize:20,fontWeight:500,color:"#ffffff",fontFamily:"'IBM Plex Sans',sans-serif"}}>Economic Calendar</div>
          <div style={{fontSize:14,color:"#7a9ab8",fontFamily:"'IBM Plex Sans',sans-serif",maxWidth:300,lineHeight:1.6}}>High, medium and low impact events with countdown timers. API integration coming soon.</div>
          <div style={{fontSize:10,color:"#4a9eff",background:"rgba(74,158,255,0.12)",padding:"4px 12px",borderRadius:4,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:".08em"}}>COMING SOON</div>
        </div>}

      </div>
    </div>
  );
}
