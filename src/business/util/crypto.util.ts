import * as bcrypt from 'bcrypt';

export async function hash(
    data: string
): Promise<string> {
    let salt = await bcrypt.genSalt(12);
    let hash = await bcrypt.hash(data, salt);

    return hash;
}

// used solely in api
export async function verify(
    data: string,
    hash: string
): Promise<boolean> {

    let result = await bcrypt.compare(data, hash);

    return result;
}