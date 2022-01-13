import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

export interface ParsedURL {
    recipient: PublicKey | undefined;
    amount: BigNumber | undefined;
    token: PublicKey | undefined;
    references: PublicKey[] | undefined;
    label: string | undefined;
    message: string | undefined;
    memo: string | undefined;
    request: string | undefined;
}

export class ParseURLError extends Error {
    name = 'ParseURLError';
}

export function parseURL(url: string): ParsedURL {
    if (url.length > 2048) throw new ParseURLError('length invalid');

    const { protocol, pathname, searchParams } = new URL(url);
    if (protocol !== 'solana:') throw new ParseURLError('protocol invalid');

    let recipient: PublicKey | undefined;
    if (pathname) {
        try {
            recipient = new PublicKey(pathname);
        } catch (error) {
            throw new ParseURLError('ParseURLError: recipient invalid');
        }
    }

    const amountParam = searchParams.get('amount');
    let amount: BigNumber | undefined;
    if (amountParam != null) {
        if (!/^\d+(\.\d+)?$/.test(amountParam)) throw new ParseURLError('amount invalid');

        amount = new BigNumber(amountParam);
        if (amount.isNaN()) throw new ParseURLError('amount NaN');
        if (amount.isNegative()) throw new ParseURLError('amount negative');
    }

    const tokenParam = searchParams.get('spl-token');
    let token: PublicKey | undefined;
    if (tokenParam != null) {
        try {
            token = new PublicKey(tokenParam);
        } catch (error) {
            throw new ParseURLError('token invalid');
        }
    }

    const referenceParam = searchParams.getAll('reference');
    let references: PublicKey[] | undefined;
    if (referenceParam.length) {
        try {
            references = referenceParam.map((reference) => new PublicKey(reference));
        } catch (error) {
            throw new ParseURLError('reference invalid');
        }
    }

    const label = searchParams.get('label') || undefined;
    const message = searchParams.get('message') || undefined;
    const memo = searchParams.get('memo') || undefined;
    const request = searchParams.get('request') || undefined;

    return {
        recipient,
        amount,
        token,
        references,
        label,
        message,
        memo,
        request,
    };
}