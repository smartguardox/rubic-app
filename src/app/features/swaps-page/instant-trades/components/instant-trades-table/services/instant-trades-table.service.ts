import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TokensTableService } from 'src/app/shared/models/order-book/tokens-table';

@Injectable({
  providedIn: 'root'
})
export class InstantTradesTableService extends TokensTableService {
  private readonly $blockchainMode: BehaviorSubject<BLOCKCHAIN_NAME>;

  constructor() {
    super();
    this.$blockchainMode = new BehaviorSubject<BLOCKCHAIN_NAME>(BLOCKCHAIN_NAME.ETHEREUM);
  }

  public setBlockchain(blockchain: BLOCKCHAIN_NAME): void {
    this.$blockchainMode.next(blockchain);
  }

  public filterTable(): void {
    const filterFromValue = this.$filterFromValue.value?.toLowerCase();
    const filterToValue = this.$filterToValue.value?.toLowerCase();
    if (filterFromValue) {
      const filteredData = this.$visibleTableData.value.filter(
        row => row.token.from.symbol.toLowerCase() === filterFromValue
      );
      this.$visibleTableData.next(filteredData);
    }
    if (filterToValue) {
      const filteredData = this.$visibleTableData.value.filter(
        row => row.token.to.symbol.toLowerCase() === filterToValue
      );
      this.$visibleTableData.next(filteredData);
    }
  }
}
