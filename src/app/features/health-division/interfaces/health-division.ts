export interface IHealthDivisionResponse {
    current_page: number
    data: Data[]
    first_page_url: string
    from: number
    last_page: number
    last_page_url: string
    links: Link[]
    next_page_url: any
    path: string
    per_page: number
    prev_page_url: any
    to: number
    total: number
}
interface Data {
    id: number
    name: string
    type: string
    is_active: boolean
    updated_at: string
    updated_by: string
    directorate: string
}

interface Link {
    url?: string
    label: string
    page?: number
    active: boolean
}
