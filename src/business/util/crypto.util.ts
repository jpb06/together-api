import * as bcrypt from 'bcrypt';

export async function hash(
    data: string
): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(data, salt);

    return hash;
}

// used solely in api
export async function verify(
    data: string,
    hash: string
): Promise<boolean> {

    const result = await bcrypt.compare(data, hash);

    return result;
}