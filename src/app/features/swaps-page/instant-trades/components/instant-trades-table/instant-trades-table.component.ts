import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { InstantTradesApiService } from 'src/app/core/services/backend/instant-trades-api/instant-trades-api.service';
import { TradeTypeService } from 'src/app/core/services/swaps/trade-type-service/trade-type.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TokenValueType } from 'src/app/shared/models/order-book/tokens';
import { InstantTradesTradeData } from '../../../models/trade-data';
import { InstantTradesTableService } from './services/instant-trades-table.service';

@Component({
  selector: 'app-instant-trades-table',
  templateUrl: './instant-trades-table.component.html',
  styleUrls: ['./instant-trades-table.component.scss']
})
export class InstantTradesTableComponent {
  public readonly $dataSource: Observable<InstantTradesTradeData[]>;

  public readonly displayedColumns: string[];

  public readonly columnsSizes: string[];

  public readonly $tableLoading: Observable<boolean>;

  public $hasData: Observable<boolean>;

  constructor(
    private readonly instantTradesTableService: InstantTradesTableService,
    private readonly instantTradesApiService: InstantTradesApiService,
    private readonly tradeTypeService: TradeTypeService
  ) {
    this.$tableLoading = this.instantTradesTableService.getTableLoadingStatus();
    this.instantTradesTableService.setTableLoadingStatus(true);
    this.fetchSwaps();
    this.$dataSource = this.instantTradesTableService.getTableData();
    this.displayedColumns = ['Status', 'Network', 'From', 'To', 'Provider', 'Date'];
    this.columnsSizes = ['15%', '15%', '20%', '20%', '15%', '15%'];
    this.$hasData = this.instantTradesTableService.hasData();
  }

  public ngAfterViewInit(): void {
    this.tradeTypeService.getBlockchain().subscribe((mode: BLOCKCHAIN_NAME) => {
      this.instantTradesTableService.setBlockchain(mode);
      this.instantTradesTableService.setBaseTokenFilter(null);
      this.instantTradesTableService.setQuoteTokenFilter(null);
      this.instantTradesTableService.filterTable();
      this.$hasData = this.instantTradesTableService.hasData();
    });
  }

  public selectToken(tokenData: TokenValueType): void {
    if (tokenData.value) {
      if (tokenData.tokenType === 'base') {
        this.instantTradesTableService.setBaseTokenFilter(tokenData.value);
      } else {
        this.instantTradesTableService.setQuoteTokenFilter(tokenData.value);
      }
    } else if (tokenData.tokenType === 'base') {
      this.instantTradesTableService.setBaseTokenFilter(null);
    } else {
      this.instantTradesTableService.setQuoteTokenFilter(null);
    }
    this.instantTradesTableService.filterTable();
  }

  public refreshOrderBooks(): void {
    this.instantTradesTableService.setTableLoadingStatus(true);
    this.fetchSwaps();
  }

  private fetchSwaps(): void {
    this.instantTradesApiService.fetchSwaps().subscribe(
      async tradeData => {
        this.instantTradesTableService.setTableData(await Promise.all(tradeData));
        this.instantTradesTableService.filterTable();
      },
      err => console.error(err),
      () => this.instantTradesTableService.setTableLoadingStatus(false)
    );
  }
}
