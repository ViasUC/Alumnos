// src/app/services/endorsements.service.ts
import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Endorsement {
  fromUserId: number;
  message: string;
  skill: string;
  status: string;
}

const ENDORSEMENTS_RECEIVED_QUERY = gql`
  query EndorsementsReceived($toUserId: Int!) {
    endorsementsReceived(toUserId: $toUserId) {
      fromUserId
      message
      skill
      status
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class EndorsementsService {
  constructor(private apollo: Apollo) {}

  getEndorsementsForUser(toUserId: number): Observable<Endorsement[]> {
    return this.apollo
      .watchQuery<{ endorsementsReceived: Endorsement[] }>({
        query: ENDORSEMENTS_RECEIVED_QUERY,
        variables: { toUserId },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(
        map((res) => (res.data?.endorsementsReceived ?? []) as Endorsement[])
      );
  }
}
