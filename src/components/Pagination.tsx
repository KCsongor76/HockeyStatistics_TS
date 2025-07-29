import React from 'react';
import {CustomButton} from "./CustomButton";

interface PaginationProps {
    pagination: { page: number, perPage: number };
    totalPages: number;
    setPagination: (value: React.SetStateAction<{
        page: number
        perPage: number
    }>) => void
}

const Pagination: React.FC<PaginationProps> = ({pagination, totalPages, setPagination}) => {
    const perPageOptions = [10, 25, 50, 100];
    return (
        <div>
            <CustomButton
                type="neutral"
                disabled={pagination.page === 1}
                onClick={() => setPagination(p => ({...p, page: p.page - 1}))}
            >
                Previous
            </CustomButton>

            <CustomButton
                type="neutral"
                disabled={pagination.page >= totalPages}
                onClick={() => setPagination(p => ({...p, page: p.page + 1}))}
            >
                Next
            </CustomButton>

            <select
                value={pagination.perPage}
                onChange={e => setPagination({
                    page: 1,
                    perPage: parseInt(e.target.value)
                })}
            >
                {perPageOptions.map(option => (
                    <option key={option} value={option}>
                        {option} per page
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Pagination;