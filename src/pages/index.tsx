// Previous imports remain the same...

// Only changing the grid section of the return statement, the rest remains identical
return (
    <div className="container mx-auto px-4 py-8">
      {/* Header section remains the same */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">Crypto Dashboard</h1>
          <p className="text-muted-foreground">Real-time cryptocurrency market data</p>
        </div>
        <div className="flex items-center gap-4">
          <DigitalClock />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Dashboard Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Cryptocurrencies</label>
                  <Input
                    placeholder="Search by name or symbol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Cryptocurrencies to Display</label>
                  <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
                    {filteredCryptoData.map((crypto) => (
                      <div key={crypto.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={crypto.id}
                          checked={selectedCurrencies.has(crypto.id)}
                          onCheckedChange={() => toggleCurrency(crypto.id)}
                        />
                        <label
                          htmlFor={crypto.id}
                          className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          <img src={crypto.image} alt={crypto.name} className="w-4 h-4" />
                          {crypto.name}
                          <span className="text-muted-foreground">({crypto.symbol.toUpperCase()})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {displayedCryptos.map((crypto) => (
              <Card 
                key={crypto.id} 
                className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                  selectedCrypto?.id === crypto.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleCryptoClick(crypto)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <img src={crypto.image} alt={crypto.name} className="w-6 h-6" />
                  <h2 className="font-semibold">{crypto.name}</h2>
                  <Badge variant="outline" className="ml-auto">
                    {crypto.symbol.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold">${crypto.current_price.toLocaleString()}</p>
                  <p className={`text-sm ${crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {crypto.price_change_percentage_24h.toFixed(2)}% (24h)
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <div className="flex justify-end gap-2 mb-4">
              {Object.keys(TIME_RANGES).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
            <div className="h-[400px] relative">
              {chartLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : historicalData[0]?.data?.length > 0 ? (
                <ResponsiveLine
                  data={historicalData}
                  margin={{ top: 10, right: 40, bottom: 50, left: 60 }}
                  xScale={{
                    type: 'time',
                    format: 'native',
                  }}
                  yScale={{
                    type: 'linear',
                    min: 'auto',
                    max: 'auto',
                    stacked: false,
                  }}
                  axisLeft={{
                    format: value => 
                      value >= 1000
                        ? `$${(value / 1000).toFixed(1)}k`
                        : `$${value.toFixed(1)}`,
                  }}
                  axisBottom={{
                    format: formatDate,
                    tickRotation: -45,
                    tickValues: 5,
                  }}
                  enableGridX={false}
                  curve="monotoneX"
                  enablePoints={false}
                  enableSlices="x"
                  animate={true}
                  motionConfig="gentle"
                  theme={theme}
                  colors={['rgb(75, 192, 192)']}
                  lineWidth={2}
                  enableArea={true}
                  areaOpacity={0.1}
                  sliceTooltip={({ slice }) => (
                    <div className="bg-background border border-border rounded-lg shadow-lg p-2">
                      <div className="text-sm font-medium">
                        {formatDate(slice.points[0].data.x)}
                      </div>
                      <div className="text-lg font-bold">
                        ${slice.points[0].data.y.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  )}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </Card>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Asset</th>
                  <th className="text-right p-4">Price</th>
                  <th className="text-right p-4">24h Change</th>
                  <th className="text-right p-4">Market Cap</th>
                </tr>
              </thead>
              <tbody>
                {displayedCryptos.map((crypto) => (
                  <tr 
                    key={crypto.id} 
                    className={`border-b hover:bg-muted/50 cursor-pointer ${
                      selectedCrypto?.id === crypto.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleCryptoClick(crypto)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <img src={crypto.image} alt={crypto.name} className="w-6 h-6" />
                        <span className="font-medium">{crypto.name}</span>
                        <span className="text-muted-foreground">{crypto.symbol.toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="text-right p-4">${crypto.current_price.toLocaleString()}</td>
                    <td className={`text-right p-4 ${crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {crypto.price_change_percentage_24h.toFixed(2)}%
                    </td>
                    <td className="text-right p-4">${crypto.market_cap.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}